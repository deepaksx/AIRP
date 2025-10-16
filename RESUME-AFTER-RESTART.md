# Resume AIRP After Docker Installation

## Quick Checklist (5 minutes)

### ✅ **Before You Restarted**
- [x] Built complete AIRP foundation
- [x] Created all code files
- [x] Installed dependencies (pnpm install done)
- [x] Created .env file (needs 1 fix)
- [x] All documentation written

### ⏳ **After Restart (Do This Now)**

#### 1. Verify Docker is Running
```bash
docker --version
docker ps
```
Should see Docker version and running containers list (may be empty).

---

#### 2. Fix Configuration Files

**File 1: `.env`** (line 2)
```bash
# Open: C:\Dev\AIRP\.env
# Change line 2 from:
DATABASE_URL="file:./dev.db"

# To:
DATABASE_URL="postgresql://airp:airp_dev@localhost:5432/airp?schema=public"
```

**File 2: `packages/db/prisma/schema.prisma`** (line 9)
```bash
# Open: C:\Dev\AIRP\packages\db\prisma\schema.prisma
# Change line 9 from:
provider = "sqlite"

# To:
provider = "postgresql"
```

---

#### 3. Run Automated Setup

Open terminal, navigate to project:
```bash
cd C:\Dev\AIRP
.\scripts\test-setup.bat
```

**OR** use Make:
```bash
make demo
```

This will:
1. ✓ Check prerequisites (Docker now installed)
2. ✓ Install dependencies (already done, will skip)
3. ▶ Start Docker services (30 seconds)
4. ▶ Generate Prisma client
5. ▶ Run migrations
6. ▶ Seed demo data

**Expected output:**
```
[7/7] Seeding demo data...
✅ Seeding completed successfully!

📊 Summary:
   Workspace: Acme Corporation
   Entity: Acme USA (US01)
   Books: 2 (LOCAL, GROUP)
   Accounts: 15
   Sample Journal: JNL-2025-0001
```

---

#### 4. Test Database Connection

```bash
cd packages\db
pnpm tsx src\test-connection.ts
```

**Expected output:**
```
✅ All tests passed!

Trial Balance:
1110 Cash and Cash Equivalents    DR 100,000.00  CR 0.00
3100 Retained Earnings             DR 0.00        CR 100,000.00
======================================================
TOTALS                             DR 100,000.00  CR 100,000.00

Balanced: ✓ YES
```

---

#### 5. Start API Server

Open a **new terminal**:
```bash
cd C:\Dev\AIRP
pnpm dev:api
```

**Expected output:**
```
╔═══════════════════════════════════════════╗
║   🚀 AIRP API Server                      ║
║   Port:        3001                       ║
║   Database:    ✓ Connected                ║
╚═══════════════════════════════════════════╝
```

Leave this terminal running.

---

#### 6. Test API (New Terminal)

```bash
# Health check
curl http://localhost:3001/health

# Get test IDs
pnpm get-test-ids

# Trial balance (replace YOUR_ENTITY_ID with ID from above)
curl "http://localhost:3001/api/reports/trial-balance?entityId=YOUR_ENTITY_ID"
```

---

## If Something Goes Wrong

### Problem: "Docker not found"
**Solution**: Docker Desktop not running. Open Docker Desktop, wait for "running" status.

### Problem: "Port 5432 already in use"
**Solution**:
```bash
docker-compose down
make up
```

### Problem: "Connection refused"
**Solution**: Wait 30 seconds for services to start fully.
```bash
timeout /t 30
```

### Problem: "Migration failed"
**Solution**: Reset everything:
```bash
make clean
make demo
```

---

## Success Indicators

✅ Docker Desktop shows "running"
✅ `docker ps` shows 5 containers (postgres, redpanda, temporal, temporal-ui, redis)
✅ Trial balance is balanced (DR = CR)
✅ API responds at http://localhost:3001/health
✅ Can create journals via API
✅ Reports generate correctly

---

## What to Tell Claude

Just paste this:

```
I installed Docker and restarted. Project is at C:\Dev\AIRP.
I need to:
1. Fix .env (change to postgresql)
2. Fix schema.prisma (change to postgresql)
3. Run make demo
4. Test the system

Help me through the steps.
```

Or even simpler:

```
Resume AIRP. Docker is installed. What do I do next?
```

---

## Files to Reference

- `SESSION-SUMMARY.md` - Complete build history
- `START-HERE.md` - Quick start guide
- `TESTING.md` - Detailed testing
- `API-TESTING.md` - API examples

All files are in: `C:\Dev\AIRP\`

---

**Current Status**: ⏸️ Paused at Docker installation
**Next Step**: Fix 2 config files → Run setup script
**Time Required**: 5 minutes
