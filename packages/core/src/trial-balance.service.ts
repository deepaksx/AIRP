import { prisma, AccountType } from '@airp/db';
import Decimal from 'decimal.js';
import {
  TrialBalanceParams,
  TrialBalance,
  TrialBalanceRow,
} from './types';

/**
 * TrialBalanceService - Generate trial balances and account summaries
 */
export class TrialBalanceService {
  /**
   * Generate trial balance for entity/book/period
   */
  async generateTrialBalance(
    params: TrialBalanceParams,
  ): Promise<TrialBalance> {
    const {
      entityId,
      bookId,
      period,
      asOfDate,
      includeSubAccounts = true,
    } = params;

    // Build query filters
    const journalWhere: any = {
      entityId,
      status: 'POSTED',
    };

    if (period) {
      journalWhere.period = { lte: period };
    } else if (asOfDate) {
      journalWhere.journalDate = { lte: asOfDate };
    }

    const lineWhere: any = {};
    if (bookId) {
      lineWhere.bookId = bookId;
    }

    // Fetch all posted journal lines
    const lines = await prisma.journalLine.findMany({
      where: {
        ...lineWhere,
        journal: journalWhere,
      },
      include: {
        account: {
          include: {
            parent: true,
          },
        },
        journal: {
          select: {
            journalDate: true,
            period: true,
          },
        },
      },
      orderBy: {
        account: {
          code: 'asc',
        },
      },
    });

    // Group by account and calculate totals
    const accountMap = new Map<
      string,
      {
        account: any;
        debit: Decimal;
        credit: Decimal;
      }
    >();

    for (const line of lines) {
      const acc = line.account;
      if (!accountMap.has(acc.id)) {
        accountMap.set(acc.id, {
          account: acc,
          debit: new Decimal(0),
          credit: new Decimal(0),
        });
      }

      const entry = accountMap.get(acc.id)!;
      entry.debit = entry.debit.plus(line.debit.toString());
      entry.credit = entry.credit.plus(line.credit.toString());
    }

    // Build trial balance rows
    const rows: TrialBalanceRow[] = [];
    let totalDebits = new Decimal(0);
    let totalCredits = new Decimal(0);

    for (const [accountId, data] of accountMap.entries()) {
      const debit = data.debit.toNumber();
      const credit = data.credit.toNumber();
      const balance = debit - credit;

      rows.push({
        accountId,
        accountCode: data.account.code,
        accountName: data.account.name,
        accountType: data.account.type as AccountType,
        debit,
        credit,
        balance,
      });

      totalDebits = totalDebits.plus(debit);
      totalCredits = totalCredits.plus(credit);
    }

    // Sort by account code
    rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    // Build hierarchy if requested
    let finalRows = rows;
    if (includeSubAccounts) {
      finalRows = this.buildAccountHierarchy(rows);
    }

    const totalDebitsNum = totalDebits.toNumber();
    const totalCreditsNum = totalCredits.toNumber();
    const difference = totalDebitsNum - totalCreditsNum;
    const isBalanced = Math.abs(difference) < 0.01;

    return {
      entityId,
      bookId,
      period,
      asOfDate,
      rows: finalRows,
      totalDebits: totalDebitsNum,
      totalCredits: totalCreditsNum,
      isBalanced,
      difference,
    };
  }

  /**
   * Build hierarchical account structure
   */
  private buildAccountHierarchy(
    rows: TrialBalanceRow[],
  ): TrialBalanceRow[] {
    // For now, return flat list
    // TODO: Build tree structure based on account hierarchy
    return rows;
  }

  /**
   * Get account balance for specific account
   */
  async getAccountBalance(
    accountId: string,
    bookId?: string,
    asOfDate?: Date,
  ): Promise<{ debit: number; credit: number; balance: number }> {
    const where: any = {
      accountId,
      journal: {
        status: 'POSTED',
      },
    };

    if (bookId) {
      where.bookId = bookId;
    }

    if (asOfDate) {
      where.journal = {
        ...where.journal,
        journalDate: { lte: asOfDate },
      };
    }

    const aggregation = await prisma.journalLine.aggregate({
      where,
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const debit = Number(aggregation._sum.debit ?? 0);
    const credit = Number(aggregation._sum.credit ?? 0);
    const balance = debit - credit;

    return { debit, credit, balance };
  }

  /**
   * Get ledger drill-down for account
   */
  async getAccountLedger(
    accountId: string,
    bookId?: string,
    fromDate?: Date,
    toDate?: Date,
    limit = 100,
    offset = 0,
  ) {
    const where: any = {
      accountId,
      journal: {
        status: 'POSTED',
      },
    };

    if (bookId) {
      where.bookId = bookId;
    }

    if (fromDate || toDate) {
      where.journal = {
        ...where.journal,
        journalDate: {},
      };
      if (fromDate) {
        where.journal.journalDate.gte = fromDate;
      }
      if (toDate) {
        where.journal.journalDate.lte = toDate;
      }
    }

    const lines = await prisma.journalLine.findMany({
      where,
      include: {
        journal: {
          select: {
            journalNumber: true,
            journalDate: true,
            description: true,
            reference: true,
          },
        },
        account: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        { journal: { journalDate: 'asc' } },
        { lineNumber: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    // Calculate running balance
    let runningBalance = new Decimal(0);
    const result = lines.map((line) => {
      runningBalance = runningBalance
        .plus(line.debit.toString())
        .minus(line.credit.toString());

      return {
        journalId: line.journalId,
        journalNumber: line.journal.journalNumber,
        journalDate: line.journal.journalDate,
        lineNumber: line.lineNumber,
        accountCode: line.account.code,
        accountName: line.account.name,
        debit: Number(line.debit),
        credit: Number(line.credit),
        balance: runningBalance.toNumber(),
        description: line.description ?? line.journal.description,
        reference: line.reference ?? line.journal.reference,
        // SQLite: dimensions as individual fields instead of JSON
        dimensions: {
          dept: line.dimensionDept,
          project: line.dimensionProject,
          customer: line.dimensionCustomer,
        } as any,
      };
    });

    return result;
  }

  /**
   * Get income statement (P&L) summary
   */
  async getIncomeStatement(
    entityId: string,
    bookId?: string,
    period?: string,
    fromDate?: Date,
    toDate?: Date,
  ) {
    const tb = await this.generateTrialBalance({
      entityId,
      bookId,
      period,
      asOfDate: toDate,
    });

    // Group by account type
    const revenue = tb.rows.filter((r) => r.accountType === 'REVENUE');
    const cogs = tb.rows.filter((r) => r.accountType === 'COGS');
    const expenses = tb.rows.filter((r) => r.accountType === 'EXPENSE');

    const totalRevenue = revenue.reduce(
      (sum, r) => sum - r.balance,
      0,
    ); // Credit balance
    const totalCOGS = cogs.reduce((sum, r) => sum + r.balance, 0); // Debit balance
    const totalExpenses = expenses.reduce(
      (sum, r) => sum + r.balance,
      0,
    ); // Debit balance

    const grossProfit = totalRevenue - totalCOGS;
    const netIncome = grossProfit - totalExpenses;

    return {
      revenue,
      totalRevenue,
      cogs,
      totalCOGS,
      grossProfit,
      expenses,
      totalExpenses,
      netIncome,
    };
  }

  /**
   * Get balance sheet summary
   */
  async getBalanceSheet(
    entityId: string,
    bookId?: string,
    asOfDate?: Date,
  ) {
    const tb = await this.generateTrialBalance({
      entityId,
      bookId,
      asOfDate,
    });

    const assets = tb.rows.filter((r) => r.accountType === 'ASSET');
    const liabilities = tb.rows.filter(
      (r) => r.accountType === 'LIABILITY',
    );
    const equity = tb.rows.filter((r) => r.accountType === 'EQUITY');

    const totalAssets = assets.reduce((sum, r) => sum + r.balance, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, r) => sum - r.balance,
      0,
    ); // Credit balance
    const totalEquity = equity.reduce((sum, r) => sum - r.balance, 0); // Credit balance

    return {
      assets,
      totalAssets,
      liabilities,
      totalLiabilities,
      equity,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }
}
