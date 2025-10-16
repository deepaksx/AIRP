# AIRP UI Guide

## ✅ UI Options Available

### Option 1: Simple HTML Dashboard (Immediate - Already Created!)

**What it is:** A single-page HTML interface with live data from the API.

**How to use:**

1. **Make sure the API is running** (it should already be):
   ```bash
   # Check if running
   curl http://localhost:3001/health

   # If not, start it
   pnpm dev:api
   ```

2. **Open the UI:**
   - Double-click: `C:\Dev\AIRP\ui.html`
   - Or open in your browser: `file:///C:/Dev/AIRP/ui.html`

**Features:**
- ✅ Live dashboard with system status
- ✅ Trial balance summary & detail
- ✅ Income statement summary
- ✅ Create journal entries (form-based)
- ✅ Auto-post journals
- ✅ Auto-refresh every 10 seconds
- ✅ Beautiful gradient UI

**Screenshot:**
```
┌──────────────────────────────────────────────────────────┐
│  🚀 AIRP - Financial ERP                                 │
│  AI-native Accounting & Reporting Platform               │
├──────────────────────────────────────────────────────────┤
│ System Status    │ Trial Balance  │ Income Statement    │
│ ✓ healthy        │ DR: $105,000   │ Revenue: $0         │
│ ✓ Connected      │ CR: $105,000   │ Expenses: $5,000    │
│ 1 Workspace      │ ✓ Balanced     │ Net: -$5,000        │
├──────────────────────────────────────────────────────────┤
│ Create New Journal Entry                                 │
│ Description: [Monthly rent payment            ]          │
│ Date: [2025-10-15]                                       │
│                                                          │
│ Line 1                                                   │
│ Account: [1110 - Cash]    Debit: [0]    Credit: [5000] │
│                                                          │
│ Line 2                                                   │
│ Account: [5200 - Rent]    Debit: [5000] Credit: [0]    │
│                                                          │
│ [Create Journal (Draft)]                                 │
└──────────────────────────────────────────────────────────┘
```

---

### Option 2: Postman Collection (API Testing UI)

**What it is:** Professional API testing tool with saved requests.

**How to use:**

1. Download Postman: https://www.postman.com/downloads/
2. Open Postman
3. Click "Import" → Select `C:\Dev\AIRP\AIRP-Postman-Collection.json`
4. Click on any request and hit "Send"

**Features:**
- ✅ All API endpoints pre-configured
- ✅ Variables for entity/book/account IDs
- ✅ Auto-saves journal IDs between requests
- ✅ Beautiful response viewer
- ✅ Can save responses and run tests

**Included Requests:**
1. Health Check
2. Create Journal - Expense
3. Post Journal
4. Create Journal - Revenue
5. Trial Balance
6. Income Statement
7. Balance Sheet

---

### Option 3: Build a Full Next.js UI (Advanced - 30+ minutes)

Would require:
- Creating Next.js app structure
- Building React components
- Setting up routing
- Creating forms and tables
- Styling with Tailwind CSS

**Not included in current build** - but I can help you build it if you want!

---

## 🎯 Recommended: Start with Option 1 (HTML UI)

**It's ready right now!**

1. Open `C:\Dev\AIRP\ui.html` in your browser
2. You'll see live data from your API
3. Create a journal entry using the form
4. Watch the trial balance update automatically

---

## What Each UI Shows

### HTML Dashboard (`ui.html`)
- **Real-time data** from the API
- **System health** (database connection, journal count)
- **Trial Balance** (summary + detailed table)
- **Income Statement** (revenue, expenses, net income)
- **Journal Entry Form** (create and post journals)
- **Auto-refresh** (updates every 10 seconds)

### Postman Collection
- **All API endpoints** with examples
- **Request/response** viewer
- **Testing capabilities** (assertions, scripts)
- **Collection runner** (run all tests at once)
- **Environment variables** (easy ID management)

---

## Testing the HTML UI

### Test 1: View Dashboard (10 seconds)
1. Open `ui.html`
2. Check that all 3 cards show data
3. Verify "System Status" shows "✓ healthy"
4. Check "Trial Balance Summary" shows "✓ YES"

### Test 2: Create an Expense (30 seconds)
1. In the form, enter:
   - Description: "Office supplies"
   - Date: Today's date
   - Line 1: Select "5200 - Rent Expense", Debit: 1000
   - Line 2: Select "1110 - Cash", Credit: 1000
2. Click "Create Journal (Draft)"
3. Wait for success message
4. Watch trial balance update automatically

### Test 3: Create Revenue (30 seconds)
1. In the form, enter:
   - Description: "Product sales"
   - Line 1: Select "1110 - Cash", Debit: 3000
   - Line 2: Select "4100 - Product Revenue", Credit: 3000
2. Click "Create Journal (Draft)"
3. Check Income Statement updates (revenue increases)

### Test 4: Try Unbalanced (15 seconds)
1. Enter:
   - Line 1: Debit 1000
   - Line 2: Credit 999
2. Click create
3. Should show error: "Journal is not balanced"

---

## UI Features

### What Works
✅ Live data display
✅ Trial balance (summary + detail)
✅ Income statement
✅ Create journal entries
✅ Auto-post journals
✅ Real-time balance updates
✅ Error handling
✅ Form validation
✅ Auto-refresh (10s)
✅ Responsive design
✅ Beautiful gradient UI

### What's NOT Included (Yet)
❌ User authentication
❌ Multi-entity/book selection
❌ Journal history/search
❌ Edit/delete journals
❌ Advanced reports (cash flow, etc.)
❌ Document attachments
❌ Approval workflow UI
❌ Multi-currency display
❌ Date range filters

---

## Troubleshooting

### UI shows "Failed to load"
**Problem:** API not running or wrong URL

**Fix:**
1. Check API is running: `curl http://localhost:3001/health`
2. If not: `pnpm dev:api`
3. Refresh the UI page

### "CORS error" in browser console
**Problem:** Browser blocking cross-origin requests

**Fix:** The API already has CORS enabled, but if you see this:
1. Check that API is running on port 3001
2. Try opening UI in a different browser
3. Check browser dev tools console for details

### Form submission does nothing
**Problem:** JavaScript error or validation failure

**Fix:**
1. Open browser dev tools (F12)
2. Check console for errors
3. Ensure all required fields are filled
4. Check debit/credit are numbers

### Data doesn't refresh
**Problem:** Auto-refresh stopped

**Fix:**
1. Manually refresh browser page
2. Check browser console for errors
3. Verify API is still running

---

## Next Steps

### Immediate (5 minutes)
1. ✅ Open `ui.html` and explore the dashboard
2. ✅ Create 2-3 test journal entries
3. ✅ Watch trial balance update

### Short Term (15 minutes)
1. Import Postman collection
2. Test all API endpoints
3. Review API responses

### Long Term (If Interested)
1. Install Docker
2. Switch from SQLite to PostgreSQL
3. Build full Next.js frontend
4. Add authentication
5. Deploy to production

---

## File Locations

- **HTML UI:** `C:\Dev\AIRP\ui.html`
- **Postman Collection:** `C:\Dev\AIRP\AIRP-Postman-Collection.json`
- **API Server:** Running at http://localhost:3001
- **Database:** `C:\Dev\AIRP\packages\db\dev.db`

---

**You now have a working UI! Open `ui.html` in your browser and start testing!** 🎉
