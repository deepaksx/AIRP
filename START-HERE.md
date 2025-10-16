# 🚀 START HERE - AIRP Quick Start

Welcome to **AIRP**, your AI-native financial ERP system!

## 📋 Prerequisites

Make sure you have installed:
- **Node.js 20+**: https://nodejs.org/
- **pnpm 8+**: `npm install -g pnpm`
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

## ⚡ 3-Minute Setup

### Option 1: Automated (Windows)

```batch
.\scripts\test-setup.bat
```

### Option 2: Automated (Mac/Linux)

```bash
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

### Option 3: Manual (All Platforms)

```bash
# 1. Setup environment
cp .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start services, migrate, and seed
make demo
```

**Wait 30 seconds** for services to start, then continue.

---

## ✅ Verify Installation

```bash
cd packages\db
pnpm tsx src\test-connection.ts
```

**You should see:**
```
✅ All tests passed!
✓ Trial Balance: DR 100,000.00 = CR 100,000.00 (Balanced: ✓ YES)
```

---

## 🎯 Start the API Server

```bash
pnpm dev:api
```

The API will start at **http://localhost:3001**

**Test it:**
```bash
curl http://localhost:3001/health
```

---

## 🔍 Get Your Test IDs

```bash
pnpm get-test-ids
```

This prints all the IDs you need for API testing (entity, accounts, etc.)

---

## 🧪 Test the API

### 1. Get Trial Balance

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=YOUR_ENTITY_ID"
```

### 2. Create a Journal Entry

See the output from `pnpm get-test-ids` for a ready-to-copy cURL command.

### 3. Post the Journal

```bash
curl -X POST http://localhost:3001/api/ledger/journals/JOURNAL_ID/post ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: test-user" ^
  -d "{\"options\":{\"skipApprovalCheck\":true}}"
```

### 4. View Updated Trial Balance

```bash
curl "http://localhost:3001/api/reports/trial-balance?entityId=YOUR_ENTITY_ID"
```

Your new journal should appear in the balances!

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICKSTART.md** | Detailed setup instructions |
| **TESTING.md** | Complete testing guide |
| **API-TESTING.md** | API endpoint examples |
| **DELIVERY-SUMMARY.md** | Full feature list & architecture |
| **README.md** | Project overview |

---

## 🛠️ Useful Commands

```bash
# Start/stop services
make up          # Start Docker services
make down        # Stop Docker services
make logs        # View service logs

# Database
make migrate     # Run migrations
make seed        # Seed demo data
make demo        # Full setup (up + migrate + seed)

# Development
pnpm dev:api     # Start API server
pnpm test:api    # Run core tests
pnpm get-test-ids # Get test IDs

# Exploration
cd packages/db && pnpm studio  # Open Prisma Studio at http://localhost:5555
```

---

## 🎨 Explore the Data (Prisma Studio)

```bash
cd packages\db
pnpm studio
```

Opens a visual database browser at **http://localhost:5555**

Browse all tables, view journals, accounts, etc.

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | http://localhost:3001 | REST endpoints |
| **Prisma Studio** | http://localhost:5555 | Database browser |
| **Temporal UI** | http://localhost:8233 | Workflow dashboard |

---

## ❓ Troubleshooting

### Services won't start?

```bash
make down
make up
# Wait 30 seconds
```

### Migration fails?

```bash
make clean  # ⚠️ Deletes all data
make demo   # Rebuild from scratch
```

### API can't connect to database?

Check your `.env` file has the correct `DATABASE_URL`:
```
DATABASE_URL="postgresql://airp:airp_dev@localhost:5432/airp?schema=public"
```

### Need fresh start?

```bash
make clean  # Stops services + deletes data
make demo   # Complete rebuild
```

---

## 📊 What You Just Built

✅ **Database**: 50+ tables with full accounting ledger
✅ **Posting Engine**: Create, post, reverse journals
✅ **Reporting**: Trial balance, P&L, Balance sheet
✅ **API**: 10+ REST endpoints
✅ **Demo Data**: Complete sample company with transactions
✅ **Tests**: Unit + integration tests

---

## 🚀 What's Next?

1. **Explore the API**: See `API-TESTING.md`
2. **Read the Architecture**: See `DELIVERY-SUMMARY.md`
3. **Add Your Data**: Modify `packages/db/src/seed.ts`
4. **Build Features**: Add workflows, integrations, UI

---

## 💡 Quick Tips

- **All IDs are UUIDs**: Use `pnpm get-test-ids` to find them
- **Journals are immutable**: Use reverse endpoints to correct
- **Multi-book posting**: Pass multiple `bookIds` when creating journals
- **Multi-currency**: Set `currencyCode` on each line
- **Period locks**: Create a `PeriodLock` to prevent postings

---

## 🎉 You're Ready!

Your AIRP system is running. Start exploring or building!

**Questions?** Check the docs in `/` or run `make help`

---

**Built with ❤️ using TypeScript, Prisma, PostgreSQL, and Express**
