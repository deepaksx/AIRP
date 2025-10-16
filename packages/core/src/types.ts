import { z } from 'zod';
import { JournalType, JournalStatus, AccountType } from '@airp/db';

// ============================================================================
// POSTING ENGINE TYPES
// ============================================================================

export const PostingLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  accountId: z.string(),
  debit: z.number().nonnegative().default(0),
  credit: z.number().nonnegative().default(0),
  currencyCode: z.string().length(3).default('USD'),
  amountOriginal: z.number().optional(),
  fxRate: z.number().optional(),
  dimensions: z.record(z.string()).optional(),
  subledgerType: z.string().optional(),
  subledgerId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export const CreateJournalSchema = z.object({
  entityId: z.string(),
  bookIds: z.array(z.string()).min(1), // Can post to multiple books
  journalDate: z.date(),
  journalType: z.nativeEnum(JournalType).default(JournalType.STANDARD),
  description: z.string().min(1),
  reference: z.string().optional(),
  source: z.string().default('MANUAL'),
  sourceId: z.string().optional(),
  lines: z.array(PostingLineSchema).min(2), // At least 2 lines (debit + credit)
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        storageUri: z.string(),
        contentHash: z.string(),
      }),
    )
    .optional(),
});

export const PostJournalOptionsSchema = z.object({
  skipBalanceCheck: z.boolean().default(false),
  skipPeriodLockCheck: z.boolean().default(false),
  skipApprovalCheck: z.boolean().default(false),
  bypassUser: z.string().optional(), // For system postings
});

export type PostingLine = z.infer<typeof PostingLineSchema>;
export type CreateJournalDto = z.infer<typeof CreateJournalSchema>;
export type PostJournalOptions = z.infer<typeof PostJournalOptionsSchema>;

// ============================================================================
// POSTING RESULT
// ============================================================================

export interface PostingResult {
  success: boolean;
  journalId?: string;
  journalNumber?: string;
  errors: PostingError[];
  warnings: PostingWarning[];
}

export interface PostingError {
  code: string;
  message: string;
  field?: string;
  lineNumber?: number;
}

export interface PostingWarning {
  code: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================================
// TRIAL BALANCE
// ============================================================================

export interface TrialBalanceParams {
  entityId: string;
  bookId?: string;
  period?: string; // YYYY-MM format
  asOfDate?: Date;
  includeSubAccounts?: boolean;
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
  children?: TrialBalanceRow[];
}

export interface TrialBalance {
  entityId: string;
  bookId?: string;
  period?: string;
  asOfDate?: Date;
  rows: TrialBalanceRow[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  difference: number;
}

// ============================================================================
// FX CONVERSION
// ============================================================================

export interface FxConversionParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rateDate: Date;
  rateType?: 'SPOT' | 'AVERAGE' | 'PERIOD_END';
}

export interface FxConversionResult {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  rateId?: string;
}

// ============================================================================
// LEDGER QUERY
// ============================================================================

export interface LedgerQueryParams {
  entityId: string;
  bookId?: string;
  accountId?: string;
  fromDate?: Date;
  toDate?: Date;
  period?: string;
  dimensions?: Record<string, string>;
  limit?: number;
  offset?: number;
}

export interface LedgerLine {
  journalId: string;
  journalNumber: string;
  journalDate: Date;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number; // Running balance
  description: string;
  reference?: string;
  dimensions?: Record<string, string>;
}
