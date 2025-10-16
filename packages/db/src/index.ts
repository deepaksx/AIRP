import { PrismaClient } from '@prisma/client';

// Singleton instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';

// SQLite compatibility: Export enum-like types since SQLite doesn't support enums
export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOID = 'VOID',
}

export enum JournalType {
  STANDARD = 'STANDARD',
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
  ADJUSTMENT = 'ADJUSTMENT',
  RECLASSIFICATION = 'RECLASSIFICATION',
  REVERSAL = 'REVERSAL',
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  COGS = 'COGS',
}
