# AIRP API Testing Guide

This guide shows how to test the AIRP REST API.

## Prerequisites

1. Database is running and seeded: `make demo`
2. API server is running: `cd apps/api && pnpm dev`

The API runs at **http://localhost:3001**

## Testing with cURL (Windows)

### 1. Health Check

```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "database": {
    "connected": true,
    "workspaces": 1,
    "journals": 1
  },
  "version": "0.1.0"
}
```

---

### 2. Create a Journal Entry

First, get your entity ID from the seed data (or from Prisma Studio).

```bash
curl -X POST http://localhost:3001/api/ledger/journals ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: admin@acme.com" ^
  -d "{\"entityId\":\"ENTITY_ID_HERE\",\"bookIds\":[\"BOOK_ID_HERE\"],\"journalDate\":\"2025-02-01\",\"journalType\":\"STANDARD\",\"description\":\"Test journal entry\",\"source\":\"MANUAL\",\"lines\":[{\"lineNumber\":1,\"accountId\":\"CASH_ACCOUNT_ID\",\"debit\":5000,\"credit\":0,\"currencyCode\":\"USD\",\"description\":\"Cash receipt\"},{\"lineNumber\":2,\"accountId\":\"REVENUE_ACCOUNT_ID\",\"debit\":0,\"credit\":5000,\"currencyCode\":\"USD\",\"description\":\"Revenue\"}]}"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "journalId": "clxxxx...",
    "journalNumber": "JNL-2025-02-0001"
  },
  "warnings": []
}
```

---

### 3. Post a Journal

```bash
curl -X POST http://localhost:3001/api/ledger/journals/JOURNAL_ID_HERE/post ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: admin@acme.com" ^
  -d "{\"options\":{\"skipApprovalCheck\":true}}"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "journalId": "clxxxx...",
    "journalNumber": "JNL-2025-02-0001"
  },
  "warnings": []
}
```

---

### 4. Get Trial Balance

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=ENTITY_ID_HERE"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "entityId": "clxxxx...",
    "rows": [
      {
        "accountId": "...",
        "accountCode": "1110",
        "accountName": "Cash and Cash Equivalents",
        "accountType": "ASSET",
        "debit": 105000,
        "credit": 0,
        "balance": 105000
      },
      {
        "accountId": "...",
        "accountCode": "3100",
        "accountName": "Retained Earnings",
        "accountType": "EQUITY",
        "debit": 0,
        "credit": 100000,
        "balance": -100000
      },
      {
        "accountId": "...",
        "accountCode": "4100",
        "accountName": "Product Revenue",
        "accountType": "REVENUE",
        "debit": 0,
        "credit": 5000,
        "balance": -5000
      }
    ],
    "totalDebits": 105000,
    "totalCredits": 105000,
    "isBalanced": true,
    "difference": 0
  }
}
```

---

### 5. Get Income Statement

```bash
curl "http://localhost:3001/api/reports/income-statement?entityId=ENTITY_ID_HERE"
```

---

### 6. Get Balance Sheet

```bash
curl "http://localhost:3001/api/reports/balance-sheet?entityId=ENTITY_ID_HERE"
```

---

### 7. List Journals

```bash
curl "http://localhost:3001/api/ledger/journals?entityId=ENTITY_ID_HERE&limit=10"
```

---

### 8. Reverse a Journal

```bash
curl -X POST http://localhost:3001/api/ledger/journals/JOURNAL_ID_HERE/reverse ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: admin@acme.com" ^
  -d "{\"reason\":\"Correction needed\"}"
```

---

## Testing with PowerShell

For better formatting on Windows, use PowerShell:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get | ConvertTo-Json -Depth 10

# Trial Balance
$entityId = "YOUR_ENTITY_ID"
Invoke-RestMethod -Uri "http://localhost:3001/api/reports/trial-balance?entityId=$entityId" -Method Get | ConvertTo-Json -Depth 10

# Create Journal
$body = @{
    entityId = $entityId
    bookIds = @("YOUR_BOOK_ID")
    journalDate = "2025-02-01"
    journalType = "STANDARD"
    description = "Test entry"
    source = "MANUAL"
    lines = @(
        @{
            lineNumber = 1
            accountId = "YOUR_CASH_ACCOUNT_ID"
            debit = 1000
            credit = 0
            currencyCode = "USD"
        },
        @{
            lineNumber = 2
            accountId = "YOUR_REVENUE_ACCOUNT_ID"
            debit = 0
            credit = 1000
            currencyCode = "USD"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3001/api/ledger/journals" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"; "X-User-Id"="admin@acme.com"} `
    -Body $body | ConvertTo-Json -Depth 10
```

---

## Get IDs for Testing

Run this script to get all the IDs you need:

```bash
cd packages/db
pnpm tsx -e "
import { prisma } from './src/index';

async function getIds() {
  const entity = await prisma.entity.findFirst({
    include: { books: true }
  });

  const cash = await prisma.account.findFirst({
    where: { entityId: entity.id, code: '1110' }
  });

  const revenue = await prisma.account.findFirst({
    where: { entityId: entity.id, code: '4100' }
  });

  console.log('\\n=== Copy these IDs for testing ===\\n');
  console.log('ENTITY_ID:', entity.id);
  console.log('BOOK_ID:', entity.books[0].id);
  console.log('CASH_ACCOUNT_ID:', cash.id);
  console.log('REVENUE_ACCOUNT_ID:', revenue.id);
  console.log('\\n');

  await prisma.\$disconnect();
}

getIds();
"
```

---

## Complete Test Scenario

### Step 1: Start API

```bash
cd apps/api
pnpm dev
```

### Step 2: Get IDs

Use the script above to get your IDs.

### Step 3: Create and Post Journal

```bash
# Create journal (use your actual IDs)
curl -X POST http://localhost:3001/api/ledger/journals ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: test-user" ^
  -d @test-journal.json

# Save the returned journalId

# Post the journal
curl -X POST http://localhost:3001/api/ledger/journals/YOUR_JOURNAL_ID/post ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: test-user" ^
  -d "{\"options\":{\"skipApprovalCheck\":true}}"
```

### Step 4: View Trial Balance

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=YOUR_ENTITY_ID"
```

You should see your new journal reflected in the balances!

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/ledger/journals` | Create journal |
| GET | `/api/ledger/journals/:id` | Get journal by ID |
| GET | `/api/ledger/journals` | List journals |
| POST | `/api/ledger/journals/:id/post` | Post journal |
| POST | `/api/ledger/journals/:id/reverse` | Reverse journal |
| GET | `/api/reports/trial-balance` | Trial balance |
| GET | `/api/reports/income-statement` | P&L statement |
| GET | `/api/reports/balance-sheet` | Balance sheet |
| GET | `/api/reports/account-ledger` | Account ledger detail |

---

## Test Validation

### Valid Journal (Balanced)

```json
{
  "entityId": "...",
  "bookIds": ["..."],
  "journalDate": "2025-02-01",
  "description": "Test",
  "lines": [
    { "lineNumber": 1, "accountId": "...", "debit": 100, "credit": 0, "currencyCode": "USD" },
    { "lineNumber": 2, "accountId": "...", "debit": 0, "credit": 100, "currencyCode": "USD" }
  ]
}
```

### Invalid Journal (Unbalanced)

```json
{
  "entityId": "...",
  "bookIds": ["..."],
  "journalDate": "2025-02-01",
  "description": "Test",
  "lines": [
    { "lineNumber": 1, "accountId": "...", "debit": 100, "credit": 0, "currencyCode": "USD" },
    { "lineNumber": 2, "accountId": "...", "debit": 0, "credit": 50, "currencyCode": "USD" }
  ]
}
```

**Expected error:**
```json
{
  "success": false,
  "errors": [
    {
      "code": "JOURNAL_UNBALANCED",
      "message": "Journal is not balanced. Differences: {\"USD\":50}"
    }
  ]
}
```

---

## Next Steps

1. Test all endpoints
2. Verify trial balance updates correctly
3. Test journal reversal
4. Test period locks (coming soon)
5. Test approval workflows (coming soon)
