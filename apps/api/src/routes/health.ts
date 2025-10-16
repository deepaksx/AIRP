import { Router } from 'express';
import { prisma } from '@airp/db';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as result`;

    const workspaceCount = await prisma.workspace.count();
    const journalCount = await prisma.journal.count();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        workspaces: workspaceCount,
        journals: journalCount,
      },
      version: '0.1.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});
