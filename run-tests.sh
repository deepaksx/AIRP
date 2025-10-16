#!/bin/bash
# AIRP Quick Test Suite
# Run this to test all major features

echo "======================================"
echo "AIRP Quick Test Suite"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get IDs
ENTITY_ID="cmgse2ohw0007u3ul72swgakn"
BOOK_ID="cmgse2oi10009u3ulid8q3lra"
CASH_ACCT="cmgse2oij000hu3ul3jk7dlok"
SALARY_ACCT="cmgse2ojv0011u3ulj55m5y3k"
REVENUE_ACCT="cmgse2ojn000xu3ulnlez7rnv"

# Test 1: Health Check
echo "Test 1: Health Check"
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ PASS${NC} - API is healthy"
else
    echo -e "${RED}✗ FAIL${NC} - API is not responding"
    exit 1
fi
echo ""

# Test 2: Trial Balance
echo "Test 2: Trial Balance"
TB=$(curl -s "http://localhost:3001/api/reports/trial-balance?entityId=$ENTITY_ID&bookId=$BOOK_ID")
if echo "$TB" | grep -q '"isBalanced":true'; then
    echo -e "${GREEN}✓ PASS${NC} - Trial balance is balanced"
else
    echo -e "${RED}✗ FAIL${NC} - Trial balance is not balanced"
    exit 1
fi
echo ""

# Test 3: Create Journal
echo "Test 3: Create Journal"
JOURNAL_DATA='{
  "entityId": "'$ENTITY_ID'",
  "bookIds": ["'$BOOK_ID'"],
  "journalDate": "2025-10-15",
  "description": "Test automated journal",
  "lines": [
    {"lineNumber": 1, "accountId": "'$SALARY_ACCT'", "debit": 2000, "credit": 0},
    {"lineNumber": 2, "accountId": "'$CASH_ACCT'", "debit": 0, "credit": 2000}
  ]
}'

CREATE_RESULT=$(curl -s -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d "$JOURNAL_DATA")

if echo "$CREATE_RESULT" | grep -q '"success":true'; then
    JOURNAL_ID=$(echo "$CREATE_RESULT" | grep -o '"journalId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ PASS${NC} - Journal created: $JOURNAL_ID"
else
    echo -e "${RED}✗ FAIL${NC} - Failed to create journal"
    echo "$CREATE_RESULT"
    exit 1
fi
echo ""

# Test 4: Post Journal
echo "Test 4: Post Journal"
POST_RESULT=$(curl -s -X POST "http://localhost:3001/api/ledger/journals/$JOURNAL_ID/post")
if echo "$POST_RESULT" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC} - Journal posted successfully"
else
    echo -e "${RED}✗ FAIL${NC} - Failed to post journal"
    exit 1
fi
echo ""

# Test 5: Verify Balance Still Holds
echo "Test 5: Verify Updated Balance"
TB2=$(curl -s "http://localhost:3001/api/reports/trial-balance?entityId=$ENTITY_ID&bookId=$BOOK_ID")
if echo "$TB2" | grep -q '"isBalanced":true'; then
    echo -e "${GREEN}✓ PASS${NC} - Trial balance still balanced after posting"
else
    echo -e "${RED}✗ FAIL${NC} - Trial balance unbalanced after posting"
    exit 1
fi
echo ""

# Test 6: Error Handling - Unbalanced Journal
echo "Test 6: Error Handling (Unbalanced Journal)"
BAD_JOURNAL='{
  "entityId": "'$ENTITY_ID'",
  "bookIds": ["'$BOOK_ID'"],
  "journalDate": "2025-10-15",
  "description": "This should fail",
  "lines": [
    {"lineNumber": 1, "accountId": "'$CASH_ACCT'", "debit": 100, "credit": 0},
    {"lineNumber": 2, "accountId": "'$SALARY_ACCT'", "debit": 0, "credit": 99}
  ]
}'

BAD_RESULT=$(curl -s -X POST http://localhost:3001/api/ledger/journals \
  -H "Content-Type: application/json" \
  -d "$BAD_JOURNAL")

if echo "$BAD_RESULT" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected unbalanced journal"
else
    echo -e "${RED}✗ FAIL${NC} - Should have rejected unbalanced journal"
    exit 1
fi
echo ""

# Test 7: Income Statement
echo "Test 7: Income Statement"
IS=$(curl -s "http://localhost:3001/api/reports/income-statement?entityId=$ENTITY_ID&bookId=$BOOK_ID")
if echo "$IS" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC} - Income statement generated"
else
    echo -e "${RED}✗ FAIL${NC} - Income statement failed"
    exit 1
fi
echo ""

# Test 8: Balance Sheet
echo "Test 8: Balance Sheet"
BS=$(curl -s "http://localhost:3001/api/reports/balance-sheet?entityId=$ENTITY_ID&bookId=$BOOK_ID")
if echo "$BS" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC} - Balance sheet generated"
else
    echo -e "${RED}✗ FAIL${NC} - Balance sheet failed"
    exit 1
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}ALL TESTS PASSED!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  ✓ API Health Check"
echo "  ✓ Trial Balance (Balanced)"
echo "  ✓ Create Journal"
echo "  ✓ Post Journal"
echo "  ✓ Balance Verification"
echo "  ✓ Error Handling"
echo "  ✓ Income Statement"
echo "  ✓ Balance Sheet"
echo ""
echo "AIRP is working correctly!"
