import { Router } from 'express';
import { TrialBalanceService } from '@airp/core';

export const reportsRouter = Router();
const tbService = new TrialBalanceService();

// GET /api/reports/trial-balance
reportsRouter.get('/trial-balance', async (req, res, next) => {
  try {
    const {
      entityId,
      bookId,
      period,
      asOfDate,
      includeSubAccounts = 'true',
    } = req.query;

    if (!entityId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'entityId is required',
        },
      });
      return;
    }

    const trialBalance = await tbService.generateTrialBalance({
      entityId: entityId as string,
      bookId: bookId as string | undefined,
      period: period as string | undefined,
      asOfDate: asOfDate ? new Date(asOfDate as string) : undefined,
      includeSubAccounts: includeSubAccounts === 'true',
    });

    res.json({
      success: true,
      data: trialBalance,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/income-statement
reportsRouter.get('/income-statement', async (req, res, next) => {
  try {
    const { entityId, bookId, period, fromDate, toDate } = req.query;

    if (!entityId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'entityId is required',
        },
      });
      return;
    }

    const incomeStatement = await tbService.getIncomeStatement(
      entityId as string,
      bookId as string | undefined,
      period as string | undefined,
      fromDate ? new Date(fromDate as string) : undefined,
      toDate ? new Date(toDate as string) : undefined,
    );

    res.json({
      success: true,
      data: incomeStatement,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/balance-sheet
reportsRouter.get('/balance-sheet', async (req, res, next) => {
  try {
    const { entityId, bookId, asOfDate } = req.query;

    if (!entityId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'entityId is required',
        },
      });
      return;
    }

    const balanceSheet = await tbService.getBalanceSheet(
      entityId as string,
      bookId as string | undefined,
      asOfDate ? new Date(asOfDate as string) : undefined,
    );

    res.json({
      success: true,
      data: balanceSheet,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/account-ledger
reportsRouter.get('/account-ledger', async (req, res, next) => {
  try {
    const {
      accountId,
      bookId,
      fromDate,
      toDate,
      limit = '100',
      offset = '0',
    } = req.query;

    if (!accountId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'accountId is required',
        },
      });
      return;
    }

    const ledger = await tbService.getAccountLedger(
      accountId as string,
      bookId as string | undefined,
      fromDate ? new Date(fromDate as string) : undefined,
      toDate ? new Date(toDate as string) : undefined,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
});
