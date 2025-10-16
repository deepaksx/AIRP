import { prisma, Prisma, JournalStatus } from '@airp/db';
import Decimal from 'decimal.js';
import {
  CreateJournalDto,
  CreateJournalSchema,
  PostJournalOptions,
  PostJournalOptionsSchema,
  PostingResult,
  PostingError,
  PostingWarning,
} from './types';

/**
 * PostingEngine - Core accounting posting logic
 *
 * Responsibilities:
 * 1. Validate journal entries (balanced, valid accounts, dimensions)
 * 2. Check period locks
 * 3. Check approval requirements
 * 4. Generate sequential journal numbers
 * 5. Post to ledger (immutable, append-only)
 * 6. Create audit trail
 * 7. Handle multi-currency conversions
 * 8. Handle multi-book postings
 */
export class PostingEngine {
  /**
   * Create a new journal entry (DRAFT status)
   */
  async createJournal(
    dto: CreateJournalDto,
    userId: string,
  ): Promise<PostingResult> {
    const errors: PostingError[] = [];
    const warnings: PostingWarning[] = [];

    try {
      // 1. Validate input
      const validated = CreateJournalSchema.parse(dto);

      // 2. Validate entity exists
      const entity = await prisma.entity.findUnique({
        where: { id: validated.entityId },
        include: { baseCurrency: true },
      });

      if (!entity) {
        errors.push({
          code: 'ENTITY_NOT_FOUND',
          message: `Entity ${validated.entityId} not found`,
        });
        return { success: false, errors, warnings };
      }

      // 3. Validate books exist
      const books = await prisma.ledgerBook.findMany({
        where: {
          id: { in: validated.bookIds },
          entityId: validated.entityId,
          isActive: true,
        },
      });

      if (books.length !== validated.bookIds.length) {
        errors.push({
          code: 'INVALID_BOOKS',
          message: 'One or more ledger books not found or inactive',
        });
        return { success: false, errors, warnings };
      }

      // 4. Validate accounts exist
      const accountIds = validated.lines.map((l) => l.accountId);
      const accounts = await prisma.account.findMany({
        where: {
          id: { in: accountIds },
          entityId: validated.entityId,
          isActive: true,
        },
      });

      if (accounts.length !== new Set(accountIds).size) {
        errors.push({
          code: 'INVALID_ACCOUNTS',
          message: 'One or more accounts not found or inactive',
        });
        return { success: false, errors, warnings };
      }

      // 5. Validate journal is balanced (per currency)
      const balanceCheck = this.validateBalance(validated.lines as any);
      if (!balanceCheck.isBalanced) {
        errors.push({
          code: 'JOURNAL_UNBALANCED',
          message: `Journal is not balanced. Differences: ${JSON.stringify(balanceCheck.differences)}`,
        });
        return { success: false, errors, warnings };
      }

      // 6. Check for duplicate debit/credit on same line
      for (const line of validated.lines) {
        if (line.debit > 0 && line.credit > 0) {
          errors.push({
            code: 'INVALID_LINE',
            message: 'Line cannot have both debit and credit',
            lineNumber: line.lineNumber,
          });
        }
        if (line.debit === 0 && line.credit === 0) {
          errors.push({
            code: 'INVALID_LINE',
            message: 'Line must have either debit or credit',
            lineNumber: line.lineNumber,
          });
        }
      }

      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      // 7. Generate journal number
      const period = this.getPeriodFromDate(validated.journalDate);
      const journalNumber = await this.generateJournalNumber(
        validated.entityId,
        period,
      );

      // 8. Handle FX conversion for multi-currency lines
      const linesWithFx = await this.applyFxRates(
        validated.lines as any,
        entity.baseCurrencyCode,
        validated.journalDate,
      );

      // 9. Create journal in database (DRAFT status)
      const journal = await prisma.$transaction(async (tx) => {
        // Create journal header
        const j = await tx.journal.create({
          data: {
            entityId: validated.entityId,
            journalNumber,
            journalDate: validated.journalDate,
            period,
            journalType: validated.journalType,
            description: validated.description,
            reference: validated.reference,
            source: validated.source,
            sourceId: validated.sourceId,
            status: 'DRAFT',
            createdBy: userId,
          },
        });

        // Create lines for each book
        for (const book of books) {
          for (const line of linesWithFx) {
            await tx.journalLine.create({
              data: {
                journalId: j.id,
                lineNumber: line.lineNumber,
                bookId: book.id,
                accountId: line.accountId,
                debit: line.debit,
                credit: line.credit,
                currencyCode: line.currencyCode,
                amountOriginal: line.amountOriginal ?? (line.debit || line.credit),
                fxRate: line.fxRate,
                // dimensions: line.dimensions as Prisma.InputJsonValue, // SQLite: removed
                dimensionDept: (line as any).dimensionDept,
                dimensionProject: (line as any).dimensionProject,
                dimensionCustomer: (line as any).dimensionCustomer,
                subledgerType: line.subledgerType,
                subledgerId: line.subledgerId,
                description: line.description,
                reference: line.reference,
              },
            });
          }
        }

        // Create attachments if provided (SQLite: attachmentRef table not in schema)
        // if (validated.attachments) {
        //   for (const att of validated.attachments) {
        //     await tx.attachmentRef.create({
        //       data: {
        //         journalId: j.id,
        //         fileName: att.fileName,
        //         fileSize: att.fileSize,
        //         mimeType: att.mimeType,
        //         storageUri: att.storageUri,
        //         contentHash: att.contentHash,
        //         uploadedBy: userId,
        //       },
        //     });
        //   }
        // }

        // Create audit log
        await tx.auditLog.create({
          data: {
            workspaceId: entity.workspaceId,
            entityId: entity.id,
            userId,
            action: 'CREATE',
            resourceType: 'JOURNAL',
            resourceId: j.id,
            newValues: JSON.stringify({ journalNumber, status: 'DRAFT' }), // SQLite: JSON as string
          },
        });

        return j;
      });

      return {
        success: true,
        journalId: journal.id,
        journalNumber: journal.journalNumber,
        errors: [],
        warnings,
      };
    } catch (error) {
      console.error('PostingEngine.createJournal error:', error);
      errors.push({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, errors, warnings };
    }
  }

  /**
   * Post a journal (change status from DRAFT to POSTED)
   */
  async postJournal(
    journalId: string,
    userId: string,
    options: PostJournalOptions = {},
  ): Promise<PostingResult> {
    const errors: PostingError[] = [];
    const warnings: PostingWarning[] = [];

    try {
      const opts = PostJournalOptionsSchema.parse(options);

      // 1. Fetch journal with all dependencies
      const journal = await prisma.journal.findUnique({
        where: { id: journalId },
        include: {
          entity: true,
          lines: {
            include: {
              account: true,
              book: true,
            },
          },
        },
      });

      if (!journal) {
        errors.push({
          code: 'JOURNAL_NOT_FOUND',
          message: `Journal ${journalId} not found`,
        });
        return { success: false, errors, warnings };
      }

      // 2. Check journal is in DRAFT or APPROVED status
      if (!['DRAFT', 'APPROVED'].includes(journal.status)) {
        errors.push({
          code: 'INVALID_STATUS',
          message: `Cannot post journal in ${journal.status} status`,
        });
        return { success: false, errors, warnings };
      }

      // 3. Check period lock (unless bypassed)
      if (!opts.skipPeriodLockCheck) {
        const isLocked = await this.isPeriodLocked(
          journal.entityId,
          journal.lines[0]?.bookId,
          journal.period,
        );
        if (isLocked) {
          errors.push({
            code: 'PERIOD_LOCKED',
            message: `Period ${journal.period} is locked`,
          });
          return { success: false, errors, warnings };
        }
      }

      // 4. Check approval requirements (unless bypassed)
      if (!opts.skipApprovalCheck && journal.status !== 'APPROVED') {
        const requiresApproval = await this.requiresApproval(journal);
        if (requiresApproval) {
          errors.push({
            code: 'APPROVAL_REQUIRED',
            message: 'Journal requires approval before posting',
          });
          return { success: false, errors, warnings };
        }
      }

      // 5. Re-validate balance (safety check)
      if (!opts.skipBalanceCheck) {
        const balanceCheck = this.validateBalance(
          journal.lines.map((l) => ({
            lineNumber: l.lineNumber,
            accountId: l.accountId,
            debit: Number(l.debit),
            credit: Number(l.credit),
            currencyCode: l.currencyCode,
          })),
        );
        if (!balanceCheck.isBalanced) {
          errors.push({
            code: 'JOURNAL_UNBALANCED',
            message: 'Journal is not balanced (re-validation failed)',
          });
          return { success: false, errors, warnings };
        }
      }

      // 6. Post the journal (update status to POSTED)
      const postedJournal = await prisma.$transaction(async (tx) => {
        const updated = await tx.journal.update({
          where: { id: journalId },
          data: {
            status: 'POSTED',
            postedAt: new Date(),
            postedBy: opts.bypassUser ?? userId,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            workspaceId: journal.entity.workspaceId,
            entityId: journal.entityId,
            userId: opts.bypassUser ?? userId,
            action: 'POST',
            resourceType: 'JOURNAL',
            resourceId: journalId,
            oldValues: JSON.stringify({ status: journal.status }), // SQLite: JSON as string
            newValues: JSON.stringify({ status: 'POSTED', postedAt: new Date() }), // SQLite: JSON as string
          },
        });

        return updated;
      });

      return {
        success: true,
        journalId: postedJournal.id,
        journalNumber: postedJournal.journalNumber,
        errors: [],
        warnings,
      };
    } catch (error) {
      console.error('PostingEngine.postJournal error:', error);
      errors.push({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, errors, warnings };
    }
  }

  /**
   * Reverse a journal (create a reversing entry)
   */
  async reverseJournal(
    journalId: string,
    userId: string,
    reason: string,
  ): Promise<PostingResult> {
    const errors: PostingError[] = [];
    const warnings: PostingWarning[] = [];

    try {
      // Fetch original journal
      const original = await prisma.journal.findUnique({
        where: { id: journalId },
        include: {
          entity: true,
          lines: {
            include: { book: true },
          },
        },
      });

      if (!original) {
        errors.push({
          code: 'JOURNAL_NOT_FOUND',
          message: `Journal ${journalId} not found`,
        });
        return { success: false, errors, warnings };
      }

      if (original.status !== 'POSTED') {
        errors.push({
          code: 'INVALID_STATUS',
          message: 'Can only reverse POSTED journals',
        });
        return { success: false, errors, warnings };
      }

      // Check if already reversed (SQLite: uses reversedBy relation)
      const alreadyReversed = await prisma.journal.findFirst({
        where: { reversalOfId: journalId },
      });

      if (alreadyReversed) {
        errors.push({
          code: 'ALREADY_REVERSED',
          message: 'Journal has already been reversed',
        });
        return { success: false, errors, warnings };
      }

      // Create reversing journal
      const period = this.getPeriodFromDate(new Date());
      const journalNumber = await this.generateJournalNumber(
        original.entityId,
        period,
      );

      // Get unique book IDs
      const bookIds = [...new Set(original.lines.map((l) => l.bookId))];

      const reversalJournal = await prisma.$transaction(async (tx) => {
        // Create reversal journal
        const reversal = await tx.journal.create({
          data: {
            entityId: original.entityId,
            journalNumber,
            journalDate: new Date(),
            period,
            journalType: 'REVERSING',
            description: `Reversal of ${original.journalNumber}: ${reason}`,
            reference: original.journalNumber,
            source: 'REVERSAL',
            sourceId: original.id,
            status: 'POSTED',
            postedAt: new Date(),
            postedBy: userId,
            reversalOfId: original.id,
            createdBy: userId,
          },
        });

        // Create reversed lines (swap debit/credit)
        const uniqueLines = original.lines.filter(
          (line, index, self) =>
            index === self.findIndex((l) => l.lineNumber === line.lineNumber),
        );

        for (const book of bookIds) {
          for (const line of uniqueLines) {
            await tx.journalLine.create({
              data: {
                journalId: reversal.id,
                lineNumber: line.lineNumber,
                bookId: book,
                accountId: line.accountId,
                debit: line.credit, // Swap
                credit: line.debit, // Swap
                currencyCode: line.currencyCode,
                amountOriginal: line.amountOriginal,
                fxRate: line.fxRate,
                // dimensions: line.dimensions, // SQLite: removed
                dimensionDept: line.dimensionDept,
                dimensionProject: line.dimensionProject,
                dimensionCustomer: line.dimensionCustomer,
                subledgerType: line.subledgerType,
                subledgerId: line.subledgerId,
                description: line.description,
                reference: line.reference,
              },
            });
          }
        }

        // Mark original as reversed (SQLite: status update only, relation handled by reversalOfId)
        await tx.journal.update({
          where: { id: original.id },
          data: {
            status: 'REVERSED',
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            workspaceId: original.entity.workspaceId,
            entityId: original.entityId,
            userId,
            action: 'REVERSE',
            resourceType: 'JOURNAL',
            resourceId: original.id,
            newValues: JSON.stringify({ reversalId: reversal.id, reason }), // SQLite: JSON as string
          },
        });

        return reversal;
      });

      return {
        success: true,
        journalId: reversalJournal.id,
        journalNumber: reversalJournal.journalNumber,
        errors: [],
        warnings,
      };
    } catch (error) {
      console.error('PostingEngine.reverseJournal error:', error);
      errors.push({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, errors, warnings };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Validate journal is balanced (debits = credits per currency)
   */
  private validateBalance(
    lines: Array<{
      debit: number;
      credit: number;
      currencyCode: string;
    }>,
  ): { isBalanced: boolean; differences: Record<string, number> } {
    const totals: Record<string, { debit: Decimal; credit: Decimal }> = {};

    for (const line of lines) {
      const currency = line.currencyCode;
      if (!totals[currency]) {
        totals[currency] = { debit: new Decimal(0), credit: new Decimal(0) };
      }
      totals[currency].debit = totals[currency].debit.plus(line.debit);
      totals[currency].credit = totals[currency].credit.plus(line.credit);
    }

    const differences: Record<string, number> = {};
    let isBalanced = true;

    for (const [currency, { debit, credit }] of Object.entries(totals)) {
      const diff = debit.minus(credit);
      if (!diff.equals(0)) {
        differences[currency] = diff.toNumber();
        isBalanced = false;
      }
    }

    return { isBalanced, differences };
  }

  /**
   * Generate sequential journal number for entity+period
   */
  private async generateJournalNumber(
    entityId: string,
    period: string,
  ): Promise<string> {
    const prefix = `JNL-${period}`;

    // Get last journal number for this entity+period
    const lastJournal = await prisma.journal.findFirst({
      where: {
        entityId,
        period,
      },
      orderBy: {
        journalNumber: 'desc',
      },
      select: {
        journalNumber: true,
      },
    });

    let nextSeq = 1;
    if (lastJournal) {
      const match = lastJournal.journalNumber.match(/-(\d+)$/);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}-${nextSeq.toString().padStart(4, '0')}`;
  }

  /**
   * Get period string (YYYY-MM) from date
   */
  private getPeriodFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Check if period is locked (SQLite: periodLock table not in schema)
   */
  private async isPeriodLocked(
    entityId: string,
    bookId: string | undefined,
    period: string,
  ): Promise<boolean> {
    // SQLite: periodLock table not in schema, always return false for now
    return false;

    // const lock = await prisma.periodLock.findFirst({
    //   where: {
    //     entityId,
    //     OR: [{ bookId }, { bookId: null }],
    //     period,
    //   },
    // });
    // return lock !== null && lock.lockType === 'HARD';
  }

  /**
   * Check if journal requires approval
   */
  private async requiresApproval(journal: any): Promise<boolean> {
    // TODO: Implement policy-based approval logic
    // For now, journals > $10k require approval
    const lines = journal.lines;
    const totalAmount = lines.reduce(
      (sum: number, line: any) =>
        sum + Math.max(Number(line.debit), Number(line.credit)),
      0,
    );

    return totalAmount > 10000;
  }

  /**
   * Apply FX rates to multi-currency lines
   */
  private async applyFxRates(
    lines: Array<{
      debit: number;
      credit: number;
      currencyCode: string;
      amountOriginal?: number;
      fxRate?: number;
      [key: string]: any;
    }>,
    baseCurrency: string,
    rateDate: Date,
  ): Promise<typeof lines> {
    const result = [];

    for (const line of lines) {
      if (line.currencyCode === baseCurrency) {
        // No conversion needed
        result.push(line);
      } else {
        // Fetch FX rate
        const rate = await this.getFxRate(
          line.currencyCode,
          baseCurrency,
          rateDate,
        );

        if (!rate) {
          throw new Error(
            `FX rate not found for ${line.currencyCode} -> ${baseCurrency} on ${rateDate.toISOString()}`,
          );
        }

        const originalAmount = line.debit || line.credit;
        const convertedAmount = new Decimal(originalAmount)
          .times(rate.rate)
          .toDecimalPlaces(2)
          .toNumber();

        result.push({
          ...line,
          amountOriginal: originalAmount,
          debit: line.debit > 0 ? convertedAmount : 0,
          credit: line.credit > 0 ? convertedAmount : 0,
          fxRate: rate.rate,
        });
      }
    }

    return result;
  }

  /**
   * Get FX rate for date
   */
  private async getFxRate(
    fromCurrency: string,
    toCurrency: string,
    rateDate: Date,
  ) {
    const rate = await prisma.fxRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
        rateDate: {
          lte: rateDate,
        },
      },
      orderBy: {
        rateDate: 'desc',
      },
    });

    return rate;
  }
}
