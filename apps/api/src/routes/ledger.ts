import { Router } from 'express';
import { PostingEngine, CreateJournalSchema, PostJournalOptionsSchema } from '@airp/core';
import { prisma } from '@airp/db';
import { z } from 'zod';

export const ledgerRouter = Router();
const postingEngine = new PostingEngine();

// POST /api/ledger/journals - Create new journal
ledgerRouter.post('/journals', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    // Validate request body
    const dto = CreateJournalSchema.parse({
      ...req.body,
      journalDate: new Date(req.body.journalDate),
    });

    const result = await postingEngine.createJournal(dto, userId);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          journalId: result.journalId,
          journalNumber: result.journalNumber,
        },
        warnings: result.warnings,
      });
    } else {
      res.status(400).json({
        success: false,
        errors: result.errors,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        errors: error.errors.map(e => ({
          code: 'VALIDATION_ERROR',
          message: e.message,
          field: e.path.join('.'),
        })),
      });
    } else {
      next(error);
    }
  }
});

// GET /api/ledger/journals/:id - Get journal by ID
ledgerRouter.get('/journals/:id', async (req, res, next) => {
  try {
    const journal = await prisma.journal.findUnique({
      where: { id: req.params.id },
      include: {
        lines: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
                type: true,
              },
            },
            book: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        attachments: true,
        entity: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!journal) {
      res.status(404).json({
        success: false,
        error: {
          code: 'JOURNAL_NOT_FOUND',
          message: 'Journal not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ledger/journals/:id/post - Post a journal
ledgerRouter.post('/journals/:id/post', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const options = PostJournalOptionsSchema.parse(req.body.options || {});

    const result = await postingEngine.postJournal(
      req.params.id,
      userId,
      options,
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          journalId: result.journalId,
          journalNumber: result.journalNumber,
        },
        warnings: result.warnings,
      });
    } else {
      res.status(400).json({
        success: false,
        errors: result.errors,
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/ledger/journals/:id/reverse - Reverse a journal
ledgerRouter.post('/journals/:id/reverse', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: 'Reason is required',
          field: 'reason',
        }],
      });
      return;
    }

    const result = await postingEngine.reverseJournal(
      req.params.id,
      userId,
      reason,
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          journalId: result.journalId,
          journalNumber: result.journalNumber,
        },
        warnings: result.warnings,
      });
    } else {
      res.status(400).json({
        success: false,
        errors: result.errors,
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/ledger/journals - List journals
ledgerRouter.get('/journals', async (req, res, next) => {
  try {
    const {
      entityId,
      status,
      period,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (entityId) where.entityId = entityId as string;
    if (status) where.status = status as string;
    if (period) where.period = period as string;

    const journals = await prisma.journal.findMany({
      where,
      include: {
        entity: {
          select: {
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            lines: true,
          },
        },
      },
      orderBy: {
        journalDate: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.journal.count({ where });

    res.json({
      success: true,
      data: journals,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
});
