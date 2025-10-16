# AIRP - Complete Startup Guide

Welcome to AIRP (AI-native Financial ERP)! Your complete accounting system is ready to use.

## What's Been Built

### Backend API (100% Complete)
- **Express.js REST API** running on `http://localhost:3001`
- **SQLite Database** with seeded demo data
- **Financial Reports**: Trial Balance, Income Statement, Balance Sheet
- **Journal Entry System**: Create and post accounting transactions
- **Health Check**: System status and database info

### Next.js Web Application (100% Complete)
- **Modern React Dashboard** running on `http://localhost:3000`
- **5 Complete Pages**:
  1. Dashboard - Overview with stats and system status
  2. Journals - Create and post journal entries with real-time validation
  3. Trial Balance - Detailed account balances with DR/CR breakdown
  4. Income Statement - Revenue, expenses, and profitability
  5. Balance Sheet - Assets, liabilities, and equity

- **Features**:
  - Real-time data fetching with React Query
  - Responsive design with Tailwind CSS
  - Form validation with react-hook-form
  - Toast notifications
  - Currency formatting
  - Color-coded financial data
  - Loading states and error handling

## Quick Start (Choose Your UI)

### Option 1: Next.js Web App (Recommended)

1. **Start the API Server** (if not already running):
   ```bash
   cd C:\Dev\AIRP
   pnpm dev:api
   ```
   API will be available at: http://localhost:3001

2. **Start the Next.js App**:
   ```bash
   cd C:\Dev\AIRP\apps\web
   pnpm dev
   ```
   Web app will be available at: http://localhost:3000

3. **Access the Application**:
   Open your browser to: http://localhost:3000
   You'll automatically be redirected to the dashboard

### Option 2: HTML UI (Single File)

1. **Start the API Server** (if not already running):
   ```bash
   cd C:\Dev\AIRP
   pnpm dev:api
   ```

2. **Open the HTML File**:
   - Open `C:\Dev\AIRP\ui.html` in your browser
   - All features work immediately (no build step needed)

## Using the Application

### Dashboard
- View overall financial health
- See total debits, credits, and net income
- Check ledger balance status
- Monitor system health

### Journal Entry
1. Click "Journals" in the sidebar
2. Fill in:
   - Description (e.g., "Monthly rent payment")
   - Date
   - Journal lines with account, debit, and credit amounts
3. Ensure the journal balances (Total DR = Total CR)
4. Click "Create & Post Journal"
5. Journal is automatically posted to the ledger

### Trial Balance
- View all account balances
- See debit and credit totals
- Verify the ledger is balanced
- Check account types (Asset, Liability, Equity, Revenue, Expense)

### Income Statement
- View revenue accounts
- View expense accounts (including COGS)
- Calculate net income (profit or loss)
- Analyze profitability

### Balance Sheet
- View assets (what the company owns)
- View liabilities (what the company owes)
- View equity (owner's equity)
- Verify accounting equation: Assets = Liabilities + Equity

## Demo Data

The system comes pre-loaded with:
- **Entity**: Demo Corporation (ID: cmgse2ohw0007u3ul72swgakn)
- **Book**: Main Book (ID: cmgse2oi10009u3ulid8q3lra)
- **Chart of Accounts**:
  - 1110 - Cash and Cash Equivalents (Asset)
  - 2110 - Accounts Payable (Liability)
  - 3100 - Common Stock (Equity)
  - 4100 - Service Revenue (Revenue)
  - 5200 - Rent Expense (Expense)
  - And more...

## Architecture

### Technology Stack
- **Backend**: Express.js + TypeScript + Prisma ORM + SQLite
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

### Project Structure
```
C:\Dev\AIRP\
├── apps/
│   ├── api/           # Backend Express.js API
│   │   ├── src/
│   │   │   ├── index.ts           # Main server
│   │   │   ├── routes/            # API routes
│   │   │   └── controllers/       # Business logic
│   │   └── dev.sqlite             # SQLite database
│   └── web/           # Next.js frontend
│       ├── app/                   # App Router pages
│       │   ├── dashboard/         # Dashboard pages
│       │   │   ├── page.tsx       # Dashboard home
│       │   │   ├── journals/      # Journal entry
│       │   │   ├── trial-balance/ # Trial balance
│       │   │   ├── income-statement/
│       │   │   └── balance-sheet/
│       │   └── layout.tsx         # Dashboard layout
│       ├── components/ui/         # Reusable components
│       ├── lib/                   # Utilities
│       │   ├── api-client.ts      # API integration
│       │   ├── constants.ts       # Demo IDs
│       │   └── utils.ts           # Helper functions
│       └── package.json
├── packages/
│   ├── core/          # Shared business logic
│   └── db/            # Database & Prisma schema
├── ui.html            # Single-file HTML UI
└── pnpm-workspace.yaml
```

## API Endpoints

### Health Check
- `GET /health` - System status and database info

### Journal Entries
- `POST /api/ledger/journals` - Create a new journal
- `POST /api/ledger/journals/:id/post` - Post a journal to the ledger

### Financial Reports
- `GET /api/reports/trial-balance?entityId=...&bookId=...` - Trial Balance
- `GET /api/reports/income-statement?entityId=...&bookId=...` - Income Statement
- `GET /api/reports/balance-sheet?entityId=...&bookId=...` - Balance Sheet

## Troubleshooting

### Port Already in Use
If you see "Port 3001 is already in use":
- The API is already running (this is fine!)
- Just start the Next.js app on port 3000

If you see "Port 3000 is already in use":
- Stop any other Next.js apps running
- Or change the port: `pnpm dev -- -p 3001`

### API Connection Failed
1. Make sure the API is running on http://localhost:3001
2. Check the API health: http://localhost:3001/health
3. Verify the database exists: `C:\Dev\AIRP\apps\api\dev.sqlite`

### Database Errors
If you need to reset the database:
```bash
cd C:\Dev\AIRP
pnpm db:generate  # Regenerate Prisma client
pnpm prisma db push  # Recreate schema
pnpm db:seed  # Reload demo data
```

### Build Errors
If you see TypeScript or build errors:
```bash
cd C:\Dev\AIRP\apps\web
pnpm install  # Reinstall dependencies
```

## Development Commands

### Backend API
```bash
pnpm dev:api      # Start API server (port 3001)
pnpm db:generate  # Generate Prisma client
pnpm db:seed      # Seed demo data
```

### Next.js Web App
```bash
cd apps/web
pnpm dev          # Start dev server (port 3000)
pnpm build        # Build for production
pnpm start        # Start production server
```

### Full System
```bash
# Terminal 1 - Start API
pnpm dev:api

# Terminal 2 - Start Next.js
cd apps/web && pnpm dev
```

## Next Steps

### Immediate Use
1. Start both servers (API + Next.js)
2. Open http://localhost:3000
3. Explore the dashboard and create test journal entries
4. View financial reports

### Enhancements You Can Add
1. **Authentication**: Add user login and role-based access
2. **Multi-entity**: Support multiple companies/entities
3. **Date Range Filters**: Filter reports by date range
4. **Account Management**: CRUD operations for chart of accounts
5. **Journal History**: View and edit draft journals
6. **Audit Trail**: Track who created/posted each journal
7. **Export**: Download reports as PDF or Excel
8. **Dark Mode**: Toggle theme
9. **Real-time Updates**: WebSocket for live data
10. **Advanced Reports**: Cash flow, ratio analysis, etc.

## Support

### Files to Check
- **API Code**: `apps/api/src/`
- **Next.js Pages**: `apps/web/app/dashboard/`
- **API Client**: `apps/web/lib/api-client.ts`
- **Database Schema**: `packages/db/prisma/schema.prisma`

### Logs
- **API Logs**: Check terminal running `pnpm dev:api`
- **Browser Console**: Check for frontend errors (F12)
- **Network Tab**: Verify API calls are succeeding

## What's Working

✅ Complete backend API with all financial reports
✅ SQLite database with seeded demo data
✅ Next.js dashboard with 5 pages
✅ Journal entry form with validation
✅ Trial balance report
✅ Income statement report
✅ Balance sheet report
✅ Real-time balance checking
✅ Responsive design
✅ Loading states and error handling
✅ Toast notifications
✅ Currency formatting
✅ Color-coded financial data
✅ Auto-posting of journals
✅ Query invalidation for fresh data

## Conclusion

Your complete AIRP system is ready! Both the backend and frontend are fully functional. You can:
- Create journal entries
- View trial balance
- Generate income statements
- See balance sheets
- Monitor system health

Everything is working together seamlessly. Start exploring and building your accounting workflows!
