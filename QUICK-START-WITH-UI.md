# 🚀 AIRP Quick Start with UI

## Your System is Ready! (2 minutes to start using)

### What You Have
- ✅ **API Server** running on http://localhost:3001
- ✅ **SQLite Database** with demo data (seeded)
- ✅ **HTML Dashboard** (`ui.html`) - Ready to open!
- ✅ **Postman Collection** - Professional API testing
- ✅ **Balanced Ledger** - $105,000 DR = $105,000 CR

---

## 🎯 Start Here (30 seconds)

### Step 1: Open the UI
**Double-click this file:** `C:\Dev\AIRP\ui.html`

It will open in your browser and show:
- System health status
- Current trial balance
- Income statement
- Form to create new journals

### Step 2: Test It
In the form on the page:
1. Enter description: "Test transaction"
2. Set Line 1: Account "5200 - Rent Expense", Debit: 1000
3. Set Line 2: Account "1110 - Cash", Credit: 1000
4. Click "Create Journal (Draft)"
5. Watch it auto-post and see balance update!

**That's it! You're using AIRP!** 🎉

---

## What You Can Do Right Now

### Option A: Use the HTML Dashboard
- **File:** `ui.html` (just double-click it)
- **Features:**
  - View live trial balance
  - See income statement
  - Create journal entries
  - Auto-refresh data
  - Beautiful UI

### Option B: Use Postman (API Testing Tool)
1. Download Postman: https://www.postman.com/downloads/
2. Import: `AIRP-Postman-Collection.json`
3. Click any request and hit "Send"

### Option C: Use Command Line
```bash
# Health check
curl http://localhost:3001/health

# Trial balance
curl "http://localhost:3001/api/reports/trial-balance?entityId=cmgse2ohw0007u3ul72swgakn&bookId=cmgse2oi10009u3ulid8q3lra"

# Create journal
curl -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d @test-journal.json
```

---

## Current Account Balances

```
ASSETS:
  Cash and Cash Equivalents    $95,000 DR

EQUITY:
  Retained Earnings            $100,000 CR

EXPENSES:
  Rent Expense                 $5,000 DR

────────────────────────────────────────
TOTAL                          $105,000 DR = $105,000 CR ✓
```

**Net Income:** -$5,000 (we have expenses but no revenue yet)

---

## Try These Scenarios

### Scenario 1: Record a Sale
Create a revenue journal:
- Cash (Debit): $10,000
- Product Revenue (Credit): $10,000
- **Result:** Cash increases, income statement shows profit

### Scenario 2: Pay Salary
Create an expense journal:
- Salaries and Wages (Debit): $3,000
- Cash (Credit): $3,000
- **Result:** Cash decreases, expenses increase

### Scenario 3: Test Error Handling
Try to create an unbalanced journal:
- Line 1 Debit: $1,000
- Line 2 Credit: $999
- **Result:** Error message - journal rejected

---

## All Available Accounts

Copy these IDs for testing:

| Code | Account Name              | ID                           | Type     |
|------|---------------------------|------------------------------|----------|
| 1110 | Cash and Cash Equivalents | cmgse2oij000hu3ul3jk7dlok    | ASSET    |
| 1120 | Accounts Receivable       | cmgse2oip000ju3ulwovbu0uq    | ASSET    |
| 2110 | Accounts Payable          | cmgse2oj4000pu3uljqu5js02    | LIABILITY|
| 3100 | Retained Earnings         | cmgse2oje000tu3ulagu8ptin    | EQUITY   |
| 4100 | Product Revenue           | cmgse2ojn000xu3ulnlez7rnv    | REVENUE  |
| 5100 | Salaries and Wages        | cmgse2ojv0011u3ulj55m5y3k    | EXPENSE  |
| 5200 | Rent Expense              | cmgse2ojz0013u3ulelx4yxg3    | EXPENSE  |

**Entity ID:** cmgse2ohw0007u3ul72swgakn
**Book ID:** cmgse2oi10009u3ulid8q3lra

---

## Documentation Files

Everything you need:

| File | Purpose |
|------|---------|
| **ui.html** | ⭐ Visual dashboard - START HERE |
| **UI-GUIDE.md** | Complete UI documentation |
| **SQLITE-TESTING-GUIDE.md** | 10-test tutorial |
| **API-TESTING.md** | All API endpoints |
| **AIRP-Postman-Collection.json** | Postman import |
| **test-journal.json** | Sample journal data |
| **get-ids.ts** | Get all IDs from database |

---

## API Endpoints

All available at http://localhost:3001:

### Reports
- `GET /api/reports/trial-balance?entityId=X&bookId=Y`
- `GET /api/reports/income-statement?entityId=X&bookId=Y`
- `GET /api/reports/balance-sheet?entityId=X&bookId=Y`

### Journals
- `POST /api/ledger/journals` - Create (DRAFT)
- `POST /api/ledger/journals/:id/post` - Post (DRAFT → POSTED)
- `GET /api/ledger/journals/:id` - Get details

### System
- `GET /health` - System health check

---

## Troubleshooting

### UI doesn't load data
**Check:** Is API running?
```bash
curl http://localhost:3001/health
```

**If not, start it:**
```bash
pnpm dev:api
```

### Need to reset database
```bash
cd packages/db
pnpm db:seed
```

### Check what's in the database
```bash
cd packages/db
pnpm tsx src/test-connection.ts
```

---

## What's Working

✅ **Core Ledger:**
- Create journals (DRAFT status)
- Post journals (DRAFT → POSTED)
- Balance validation (rejects unbalanced)
- Audit trail (all changes logged)
- Sequential numbering (JNL-2025-10-0001)

✅ **Financial Reports:**
- Trial Balance (with drill-down)
- Income Statement (P&L)
- Balance Sheet

✅ **Business Rules:**
- Approval required for journals > $10,000
- Cannot post unbalanced journals
- Cannot have both debit and credit on same line
- Multi-book posting support

✅ **User Interfaces:**
- HTML Dashboard (visual + forms)
- Postman Collection (API testing)
- Command-line (cURL examples)

---

## What's NOT Available (SQLite Limitations)

❌ Period locking (always unlocked)
❌ Document attachments
❌ Dimension JSON (using individual columns)
❌ AP/AR subledger workflows
❌ Bank reconciliation
❌ User authentication UI

**Note:** These features ARE in the code but disabled for SQLite compatibility. Install Docker to test with PostgreSQL for full features.

---

## Next Steps

### Immediate (Now!)
1. ✅ Open `ui.html` in browser
2. ✅ Create 2-3 test journals
3. ✅ Watch trial balance update

### Today (15 minutes)
1. Read `SQLITE-TESTING-GUIDE.md`
2. Run through all 10 tests
3. Import Postman collection

### This Week (If Interested)
1. Install Docker Desktop
2. Follow `RESUME-AFTER-RESTART.md`
3. Switch to PostgreSQL
4. Test full feature set

### Future (Optional)
1. Build Next.js frontend
2. Add authentication
3. Deploy to production
4. Add AI features (copilot, auto-categorization)

---

## Support Files

**All ready to use:**
- Sample journals: `test-journal.json`, `test-revenue.json`
- Helper script: `get-ids.ts` (get all database IDs)
- Test script: `run-tests.sh` (automated testing)

---

## Success Indicators

You'll know it's working when:

✅ `ui.html` shows live data
✅ Trial balance is balanced (DR = CR)
✅ Can create and post journals
✅ Income statement updates correctly
✅ Unbalanced journals are rejected
✅ API returns JSON responses

---

## The Complete Picture

```
┌─────────────────────────────────────────────────────┐
│  Browser (ui.html)                                  │
│  ├─ Dashboard (live data)                           │
│  ├─ Journal Entry Form                              │
│  └─ Reports (trial balance, P&L)                    │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/JSON
                 ↓
┌─────────────────────────────────────────────────────┐
│  API Server (http://localhost:3001)                 │
│  ├─ Express.js REST API                             │
│  ├─ Posting Engine (validation, business rules)     │
│  └─ Report Services (trial balance, P&L, etc.)      │
└────────────────┬────────────────────────────────────┘
                 │ Prisma ORM
                 ↓
┌─────────────────────────────────────────────────────┐
│  SQLite Database (dev.db)                           │
│  ├─ Journals & Journal Lines (append-only)          │
│  ├─ Chart of Accounts                               │
│  ├─ Entities & Books                                │
│  └─ Audit Logs                                      │
└─────────────────────────────────────────────────────┘
```

---

**🎉 You're Ready! Open `ui.html` and start testing!**

Everything is working perfectly. The API is running, database is seeded, and you have a beautiful UI to interact with the system.

**Questions?** Check the documentation files or just start clicking around in the UI - it's all working! 🚀
