import { describe, it, expect, beforeAll } from 'vitest';
import { PostingEngine } from './posting-engine';
import { prisma } from '@airp/db';

describe('PostingEngine', () => {
  const engine = new PostingEngine();
  let testEntityId: string;
  let testBookId: string;
  let testAccountCashId: string;
  let testAccountEquityId: string;

  beforeAll(async () => {
    // Use existing seeded data
    const workspace = await prisma.workspace.findFirst();
    const entity = await prisma.entity.findFirst({
      where: { workspaceId: workspace!.id },
      include: { books: true },
    });

    testEntityId = entity!.id;
    testBookId = entity!.books[0].id;

    const cashAccount = await prisma.account.findFirst({
      where: { entityId: testEntityId, code: '1110' },
    });
    const equityAccount = await prisma.account.findFirst({
      where: { entityId: testEntityId, code: '3100' },
    });

    testAccountCashId = cashAccount!.id;
    testAccountEquityId = equityAccount!.id;
  });

  it('should create a balanced journal entry', async () => {
    const result = await engine.createJournal(
      {
        entityId: testEntityId,
        bookIds: [testBookId],
        journalDate: new Date('2025-02-01'),
        journalType: 'STANDARD',
        description: 'Test entry',
        source: 'TEST',
        lines: [
          {
            lineNumber: 1,
            accountId: testAccountCashId,
            debit: 1000,
            credit: 0,
            currencyCode: 'USD',
          },
          {
            lineNumber: 2,
            accountId: testAccountEquityId,
            debit: 0,
            credit: 1000,
            currencyCode: 'USD',
          },
        ],
      },
      'test-user',
    );

    expect(result.success).toBe(true);
    expect(result.journalId).toBeDefined();
    expect(result.journalNumber).toMatch(/JNL-2025-02-\d{4}/);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject unbalanced journal', async () => {
    const result = await engine.createJournal(
      {
        entityId: testEntityId,
        bookIds: [testBookId],
        journalDate: new Date('2025-02-01'),
        journalType: 'STANDARD',
        description: 'Unbalanced test',
        source: 'TEST',
        lines: [
          {
            lineNumber: 1,
            accountId: testAccountCashId,
            debit: 1000,
            credit: 0,
            currencyCode: 'USD',
          },
          {
            lineNumber: 2,
            accountId: testAccountEquityId,
            debit: 0,
            credit: 500, // Intentionally unbalanced
            currencyCode: 'USD',
          },
        ],
      },
      'test-user',
    );

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JOURNAL_UNBALANCED',
        }),
      ]),
    );
  });

  it('should post a DRAFT journal', async () => {
    // Create draft
    const createResult = await engine.createJournal(
      {
        entityId: testEntityId,
        bookIds: [testBookId],
        journalDate: new Date('2025-02-15'),
        journalType: 'STANDARD',
        description: 'Test posting',
        source: 'TEST',
        lines: [
          {
            lineNumber: 1,
            accountId: testAccountCashId,
            debit: 2000,
            credit: 0,
            currencyCode: 'USD',
          },
          {
            lineNumber: 2,
            accountId: testAccountEquityId,
            debit: 0,
            credit: 2000,
            currencyCode: 'USD',
          },
        ],
      },
      'test-user',
    );

    expect(createResult.success).toBe(true);

    // Post it
    const postResult = await engine.postJournal(
      createResult.journalId!,
      'test-user',
      { skipApprovalCheck: true },
    );

    expect(postResult.success).toBe(true);

    // Verify status changed
    const journal = await prisma.journal.findUnique({
      where: { id: createResult.journalId },
    });
    expect(journal?.status).toBe('POSTED');
    expect(journal?.postedAt).toBeDefined();
  });

  it('should reverse a posted journal', async () => {
    // Create and post
    const createResult = await engine.createJournal(
      {
        entityId: testEntityId,
        bookIds: [testBookId],
        journalDate: new Date('2025-02-20'),
        journalType: 'STANDARD',
        description: 'To be reversed',
        source: 'TEST',
        lines: [
          {
            lineNumber: 1,
            accountId: testAccountCashId,
            debit: 500,
            credit: 0,
            currencyCode: 'USD',
          },
          {
            lineNumber: 2,
            accountId: testAccountEquityId,
            debit: 0,
            credit: 500,
            currencyCode: 'USD',
          },
        ],
      },
      'test-user',
    );

    await engine.postJournal(createResult.journalId!, 'test-user', {
      skipApprovalCheck: true,
    });

    // Reverse
    const reverseResult = await engine.reverseJournal(
      createResult.journalId!,
      'test-user',
      'Testing reversal',
    );

    expect(reverseResult.success).toBe(true);
    expect(reverseResult.journalId).toBeDefined();
    expect(reverseResult.journalNumber).toMatch(/JNL-/);

    // Verify original is marked REVERSED
    const original = await prisma.journal.findUnique({
      where: { id: createResult.journalId },
    });
    expect(original?.status).toBe('REVERSED');
    expect(original?.reversedById).toBe(reverseResult.journalId);
  });
});
