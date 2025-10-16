# Quick Test Without Docker

If you don't have Docker installed, you can still test AIRP's core logic using SQLite.

## Setup (2 minutes)

### 1. Update Database URL

Edit `.env` file (create from `.env.example` if needed):

```bash
# Change from PostgreSQL:
# DATABASE_URL="postgresql://airp:airp_dev@localhost:5432/airp?schema=public"

# To SQLite:
DATABASE_URL="file:./dev.db"
```

### 2. Update Prisma Schema

Edit `packages/db/prisma/schema.prisma`:

Change line 8 from:
```prisma
provider = "postgresql"
```

To:
```prisma
provider = "sqlite"
```

### 3. Install Dependencies

```bash
cd C:\Dev\AIRP
pnpm install
```

### 4. Generate Prisma Client

```bash
pnpm db:generate
```

### 5. Create Database

```bash
pnpm --filter @airp/db prisma db push
```

### 6. Seed Data

```bash
pnpm db:seed
```

### 7. Test Connection

```bash
cd packages\db
pnpm tsx src\test-connection.ts
```

**Expected:** Trial balance should be balanced!

## Limitations with SQLite

- ❌ No TimescaleDB features (partitioning)
- ❌ No Temporal workflows
- ❌ No Kafka/Redpanda
- ❌ No advanced PostgreSQL features (RLS, JSONB indexes)
- ✅ Core posting engine works
- ✅ Trial balance works
- ✅ Reports work
- ✅ API works

## Test the API

```bash
# Start API (uses SQLite)
pnpm dev:api

# In another terminal:
curl http://localhost:3001/health
```

---

**For full features, install Docker Desktop and use PostgreSQL!**
