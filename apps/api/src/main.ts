import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ledgerRouter } from './routes/ledger';
import { reportsRouter } from './routes/reports';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/reports', reportsRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AIRP API Server                                      ║
║                                                           ║
║   Port:        ${PORT}                                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║   Database:    ${process.env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}                              ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - POST /api/ledger/journals                             ║
║   - POST /api/ledger/journals/:id/post                    ║
║   - GET  /api/reports/trial-balance                       ║
║   - GET  /api/reports/income-statement                    ║
║   - GET  /api/reports/balance-sheet                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
