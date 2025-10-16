# AIRP SQLite Testing Guide

## Quick Start (5 minutes)

The API server is already running on http://localhost:3001

### 1. Get Your IDs

First, get the entity, book, and account IDs you'll need:

```bash
cd packages/db
pnpm tsx ../../get-ids.ts
```

**Copy these IDs - you'll need them for testing:**
- Entity ID: `cmgse2ohw0007u3ul72swgakn`
- Book ID (LOCAL): `cmgse2oi10009u3ulid8q3lra`
- Cash Account: `cmgse2oij000hu3ul3jk7dlok`
- Rent Expense: `cmgse2ojz0013u3ulelx4yxg3`

---

## Test 1: Health Check (30 seconds)

Check if the API is running:

```bash
curl http://localhost:3001/health
```

**Expected Result:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T...",
  "database": {
    "connected": true,
    "workspaces": 1,
    "journals": 2
  },
  "version": "0.1.0"
}
```

✅ **Pass:** Status is "healthy" and database is connected

---

## Test 2: View Trial Balance (1 minute)

Get the current trial balance:

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=cmgse2ohw0007u3ul72swgakn&bookId=cmgse2oi10009u3ulid8q3lra"
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "accountCode": "1110",
        "accountName": "Cash and Cash Equivalents",
        "debit": 95000,
        "credit": 5000,
        "balance": 95000
      },
      {
        "accountCode": "3100",
        "accountName": "Retained Earnings",
        "debit": 0,
        "credit": 100000,
        "balance": -100000
      },
      {
        "accountCode": "5200",
        "accountName": "Rent Expense",
        "debit": 5000,
        "credit": 0,
        "balance": 5000
      }
    ],
    "totalDebits": 105000,
    "totalCredits": 105000,
    "isBalanced": true
  }
}
```

✅ **Pass:** `isBalanced: true` and debits = credits

---

## Test 3: Create a New Journal (2 minutes)

### Step 1: Create a salary expense journal

Create a file `test-salary.json`:
```json
{
  "entityId": "cmgse2ohw0007u3ul72swgakn",
  "bookIds": ["cmgse2oi10009u3ulid8q3lra"],
  "journalDate": "2025-10-15",
  "description": "Monthly salary payment",
  "lines": [
    {
      "lineNumber": 1,
      "accountId": "cmgse2ojv0011u3ulj55m5y3k",
      "debit": 15000,
      "credit": 0,
      "description": "Salaries for October"
    },
    {
      "lineNumber": 2,
      "accountId": "cmgse2oij000hu3ul3jk7dlok",
      "debit": 0,
      "credit": 15000,
      "description": "Cash payment"
    }
  ]
}
```

### Step 2: Submit the journal

```bash
curl -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d @test-salary.json
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "journalId": "cmg...",
    "journalNumber": "JNL-2025-10-0002"
  },
  "warnings": []
}
```

✅ **Pass:** Success is true and you get a journal ID

**Copy the journalId for the next step!**

---

## Test 4: Post the Journal (1 minute)

Change the journal status from DRAFT to POSTED:

```bash
# Replace YOUR_JOURNAL_ID with the ID from Test 3
curl -X POST http://localhost:3001/api/ledger/journals/YOUR_JOURNAL_ID/post
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "journalId": "cmg...",
    "journalNumber": "JNL-2025-10-0002"
  },
  "warnings": []
}
```

✅ **Pass:** Success is true

---

## Test 5: Verify Updated Trial Balance (1 minute)

Check that the trial balance reflects the new salary expense:

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=cmgse2ohw0007u3ul72swgakn&bookId=cmgse2oi10009u3ulid8q3lra"
```

**Expected Changes:**
- Cash reduced by $15,000 (now $80,000)
- Salaries expense increased by $15,000
- **Total debits = Total credits = $120,000**
- `isBalanced: true`

✅ **Pass:** Balances updated correctly and still balanced

---

## Test 6: Create Revenue Entry (2 minutes)

Test posting revenue (credit side):

Create `test-revenue.json`:
```json
{
  "entityId": "cmgse2ohw0007u3ul72swgakn",
  "bookIds": ["cmgse2oi10009u3ulid8q3lra"],
  "journalDate": "2025-10-15",
  "description": "Product sales for October",
  "lines": [
    {
      "lineNumber": 1,
      "accountId": "cmgse2oij000hu3ul3jk7dlok",
      "debit": 50000,
      "credit": 0,
      "description": "Cash received"
    },
    {
      "lineNumber": 2,
      "accountId": "cmgse2ojn000xu3ulnlez7rnv",
      "debit": 0,
      "credit": 50000,
      "description": "Product sales"
    }
  ]
}
```

Submit and post:
```bash
# Create
curl -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d @test-revenue.json

# Post (use the returned journalId)
curl -X POST http://localhost:3001/api/ledger/journals/YOUR_JOURNAL_ID/post
```

✅ **Pass:** Cash increases, revenue account shows credit balance

---

## Test 7: Income Statement (1 minute)

Generate a profit & loss report:

```bash
curl "http://localhost:3001/api/reports/income-statement?entityId=cmgse2ohw0007u3ul72swgakn&bookId=cmgse2oi10009u3ulid8q3lra"
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "revenue": [...],
    "totalRevenue": 50000,
    "expenses": [...],
    "totalExpenses": 20000,
    "netIncome": 30000
  }
}
```

✅ **Pass:** Revenue - Expenses = Net Income

---

## Test 8: Balance Sheet (1 minute)

```bash
curl "http://localhost:3001/api/reports/balance-sheet?entityId=cmgse2ohw0007u3ul72swgakn&bookId=cmgse2oi10009u3ulid8q3lra"
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "assets": [...],
    "totalAssets": 130000,
    "liabilities": [],
    "totalLiabilities": 0,
    "equity": [...],
    "totalEquity": 130000,
    "totalLiabilitiesAndEquity": 130000
  }
}
```

✅ **Pass:** Assets = Liabilities + Equity

---

## Test 9: Error Handling (2 minutes)

### Test 9a: Unbalanced Journal

Create `test-unbalanced.json`:
```json
{
  "entityId": "cmgse2ohw0007u3ul72swgakn",
  "bookIds": ["cmgse2oi10009u3ulid8q3lra"],
  "journalDate": "2025-10-15",
  "description": "This should fail",
  "lines": [
    {
      "lineNumber": 1,
      "accountId": "cmgse2oij000hu3ul3jk7dlok",
      "debit": 1000,
      "credit": 0
    },
    {
      "lineNumber": 2,
      "accountId": "cmgse2ojz0013u3ulelx4yxg3",
      "debit": 0,
      "credit": 999
    }
  ]
}
```

```bash
curl -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d @test-unbalanced.json
```

**Expected Result:**
```json
{
  "success": false,
  "errors": [
    {
      "code": "JOURNAL_UNBALANCED",
      "message": "Journal is not balanced. Differences: {\"USD\":1}"
    }
  ]
}
```

✅ **Pass:** Error returned, journal not created

### Test 9b: Invalid Account

```bash
curl -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "cmgse2ohw0007u3ul72swgakn",
    "bookIds": ["cmgse2oi10009u3ulid8q3lra"],
    "journalDate": "2025-10-15",
    "description": "Invalid account test",
    "lines": [
      {"lineNumber": 1, "accountId": "invalid-id", "debit": 100, "credit": 0},
      {"lineNumber": 2, "accountId": "cmgse2oij000hu3ul3jk7dlok", "debit": 0, "credit": 100}
    ]
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "errors": [
    {
      "code": "INVALID_ACCOUNTS",
      "message": "One or more accounts not found or inactive"
    }
  ]
}
```

✅ **Pass:** Validation catches invalid account

---

## Test 10: Direct Database Query (1 minute)

Verify data directly in the database:

```bash
cd packages/db
pnpm tsx src/test-connection.ts
```

**Expected Result:**
```
✅ All tests passed!

Trial Balance:
1110 Cash and Cash Equivalents    DR 130,000.00  CR 20,000.00
3100 Retained Earnings             DR 0.00        CR 100,000.00
4100 Product Revenue               DR 0.00        CR 50,000.00
5100 Salaries and Wages            DR 15,000.00   CR 0.00
5200 Rent Expense                  DR 5,000.00    CR 0.00
======================================================
TOTALS                             DR 150,000.00  CR 170,000.00

Balanced: ✓ YES
```

✅ **Pass:** Database matches API results

---

## Advanced Tests

### Test Multi-Book Posting

Post the same transaction to both LOCAL and GROUP books:

```json
{
  "entityId": "cmgse2ohw0007u3ul72swgakn",
  "bookIds": ["cmgse2oi10009u3ulid8q3lra", "cmgse2oi5000bu3ul3pnr96fz"],
  "journalDate": "2025-10-15",
  "description": "Multi-book test",
  "lines": [
    {"lineNumber": 1, "accountId": "cmgse2oij000hu3ul3jk7dlok", "debit": 1000, "credit": 0},
    {"lineNumber": 2, "accountId": "cmgse2ojz0013u3ulelx4yxg3", "debit": 0, "credit": 1000}
  ]
}
```

✅ **Pass:** Journal lines created for both books

---

## Troubleshooting

### API Not Responding

**Check if server is running:**
```bash
curl http://localhost:3001/health
```

**Restart if needed:**
1. Press `Ctrl+C` in the terminal running the API
2. Run: `pnpm dev:api`

### Database Errors

**Reset database:**
```bash
cd packages/db
pnpm db:seed
```

### View All Journals

```bash
cd packages/db
pnpm tsx -e "import {prisma} from './src/index'; prisma.journal.findMany({include:{lines:true}}).then(j=>console.log(JSON.stringify(j,null,2))).finally(()=>prisma.\$disconnect())"
```

---

## Success Criteria

You've successfully tested AIRP if:

- ✅ All 10 tests pass
- ✅ Trial balance remains balanced after each transaction
- ✅ Error handling works correctly
- ✅ Financial reports generate accurately
- ✅ API responds within 1 second for all operations

---

## What's Working

✅ Journal creation and posting
✅ Trial balance calculation
✅ Income statement generation
✅ Balance sheet generation
✅ Multi-book posting
✅ Balance validation
✅ Error handling and validation
✅ Audit logging
✅ Sequential journal numbering

## SQLite Limitations (Not Available)

❌ Period locking (always unlocked)
❌ Document attachments
❌ Dimension JSON fields (uses individual columns instead)
❌ Advanced subledger features
❌ Bank reconciliation
❌ AP/AR workflows

---

## Next Steps

1. **Install Docker** to test with full PostgreSQL schema
2. **Explore the API** - all endpoints are documented in `API-TESTING.md`
3. **Review the code** - core logic in `packages/core/src/posting-engine.ts`
4. **Check documentation** - see `SESSION-SUMMARY.md` for complete build history

---

**Current Status:** ✅ Fully functional with SQLite
**API Server:** http://localhost:3001
**Database:** SQLite at `packages/db/dev.db`
