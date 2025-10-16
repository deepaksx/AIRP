# AIRP Testing Guide

This guide will help you test the AIRP foundation.

## Prerequisites

Ensure you have installed:
- **Node.js 20+**: `node --version`
- **pnpm 8+**: `pnpm --version`
- **Docker & Docker Compose**: `docker --version` and `docker-compose --version`

## Step-by-Step Testing

### 1. Initial Setup

```bash
# Clone or navigate to the AIRP directory
cd C:\Dev\AIRP

# Copy environment file
cp .env.example .env

# Install all dependencies
pnpm install
```

**Expected output**: All packages install successfully, no errors.

---

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redpanda, Temporal, and Redis
make up

# Or manually:
docker-compose up -d
```

**Expected output**:
```
Creating airp-postgres ... done
Creating airp-redpanda ... done
Creating airp-redis ... done
Creating airp-temporal ... done
Creating airp-temporal-ui ... done
```

**Verify services are running:**
```bash
docker-compose ps
```

All services should show "Up" status.

**Check service logs** (if any issues):
```bash
make logs
# Or: docker-compose logs -f
```

**Wait ~30 seconds** for all services to fully start, especially Temporal which depends on PostgreSQL.

---

### 3. Generate Prisma Client

```bash
pnpm db:generate
```

**Expected output**:
```
✔ Generated Prisma Client
```

---

### 4. Run Database Migrations

```bash
pnpm db:migrate
```

**Expected output**:
- Prisma will create migration files
- Apply migrations to the database
- You'll be prompted to name the migration (e.g., "init")

**What this does**: Creates all tables, indexes, and constraints in PostgreSQL.

---

### 5. Seed Demo Data

```bash
pnpm db:seed
```

**Expected output**:
```
🌱 Seeding database...
🧹 Cleaning existing data...
💵 Creating currencies...
✓ Currencies created
🏢 Creating demo workspace...
✓ Workspace created: Acme Corporation (acme-corp)
👤 Creating admin user...
✓ Admin user created: admin@acme.com
🏛️ Creating entity...
✓ Entity created: Acme USA (US01)
📚 Creating ledger books...
✓ Ledger books created: LOCAL, GROUP
🗂️ Creating chart of accounts...
✓ Chart of accounts created (15 accounts)
📊 Creating dimensions...
✓ Dimensions created: DEPT with 3 members
📝 Creating sample journal entry...
✓ Sample journal created: JNL-2025-0001
🤝 Creating vendors and customers...
✓ Vendor and customer created
🔐 Creating roles...
✓ Roles created: Admin, Accountant, Viewer

✅ Seeding completed successfully!

📊 Summary:
   Workspace: Acme Corporation
   Entity: Acme USA (US01)
   Books: 2 (LOCAL, GROUP)
   Accounts: 15
   Sample Journal: JNL-2025-0001
   Dimensions: 1 (DEPT with 3 members)
   Vendor: AWS
   Customer: Beta Corp
```

---

### 6. Test Database Connection

```bash
cd packages/db
pnpm tsx src/test-connection.ts
```

**Expected output**:
```
🧪 Testing database connection...

1️⃣ Testing basic connection...
   ✓ Database is connected

2️⃣ Counting workspaces...
   ✓ Found 1 workspace(s)

3️⃣ Fetching workspace details...
   ✓ Workspace: Acme Corporation (acme-corp)
     Plan: PLUS
     Entities: 1

   📍 Entity: Acme USA
     Code: US01
     Currency: USD
     Top-level accounts: 5

4️⃣ Counting journals...
   ✓ Found 1 journal(s)

5️⃣ Fetching sample journal...
   ✓ Journal: JNL-2025-0001
     Date: 2025-01-15
     Status: POSTED
     Lines: 2
       1. Cash and Cash Equivalents: DR 100000
       2. Retained Earnings: CR 100000

6️⃣ Calculating trial balance...
   ✓ Trial Balance:
     1110 Cash and Cash Equivalents       DR    100000.00 CR         0.00
     3100 Retained Earnings               DR         0.00 CR    100000.00
     ======================================================================
     TOTALS                               DR    100000.00 CR    100000.00

     Balanced: ✓ YES

✅ All tests passed!
```

---

### 7. Explore Data with Prisma Studio (Optional)

```bash
cd packages/db
pnpm studio
```

This opens a web UI at **http://localhost:5555** where you can browse all tables and data.

---

### 8. Access Service UIs

- **Temporal UI**: http://localhost:8233 (workflow orchestration dashboard)
- **Prisma Studio**: http://localhost:5555 (database browser, if running)

---

## Troubleshooting

### Problem: "Connection refused" errors

**Solution**: Services might not be fully started yet. Wait 30-60 seconds and try again.

```bash
# Check service health
docker-compose ps
docker-compose logs postgres
```

---

### Problem: "Port already in use"

**Solution**: Another service is using the port.

```bash
# Stop all Docker containers
docker-compose down

# Check what's using the port (e.g., 5432)
# Windows:
netstat -ano | findstr :5432

# Then start again
make up
```

---

### Problem: Migration fails

**Solution**: Reset the database.

```bash
# Stop services
make down

# Remove all data
docker-compose down -v

# Start fresh
make up

# Wait 30 seconds, then migrate again
pnpm db:migrate
```

---

### Problem: Seed script fails

**Solution**: Run migration first, or reset.

```bash
# Make sure migrations ran
pnpm db:migrate

# Then seed
pnpm db:seed
```

---

## Clean Slate (Reset Everything)

```bash
# Stop and remove all data
make clean

# Start fresh
make demo

# This runs: up + migrate + seed
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] All Docker services are running (`docker-compose ps`)
- [ ] Database has tables (`pnpm db:migrate` succeeded)
- [ ] Seed data is loaded (test-connection.ts shows balances)
- [ ] Trial balance is balanced (DR = CR)
- [ ] Temporal UI is accessible at http://localhost:8233
- [ ] No errors in service logs (`make logs`)

---

## Next Steps

Once testing passes, you can:

1. Start building the NestJS API
2. Create the Next.js web UI
3. Implement the posting engine
4. Build workflows (close, bank rec, etc.)

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | View service logs |
| `make clean` | Reset everything |
| `make demo` | Full setup (up + migrate + seed) |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:seed` | Load demo data |
| `pnpm db:studio` | Open Prisma Studio |

---

**Need help?** Check the logs: `make logs` or `docker-compose logs [service-name]`
