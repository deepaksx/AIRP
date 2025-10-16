# AIRP Quick Start Guide

Get AIRP running in 5 minutes.

## One-Command Setup (Windows)

```batch
.\scripts\test-setup.bat
```

## One-Command Setup (macOS/Linux)

```bash
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

## Manual Setup (Step-by-Step)

### 1. Prerequisites Check

Ensure you have:
- **Node.js 20+**: `node --version`
- **pnpm 8+**: `pnpm --version`
- **Docker Desktop**: `docker --version`

### 2. Clone and Setup

```bash
# Navigate to AIRP directory
cd C:\Dev\AIRP

# Copy environment file
cp .env.example .env

# Install dependencies
pnpm install
```

### 3. Start Services

```bash
# Start PostgreSQL, Redpanda, Temporal, Redis
make up

# Or manually:
docker-compose up -d

# Wait ~30 seconds for services to start
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations (creates all tables)
pnpm db:migrate

# When prompted, name the migration: "init"

# Load demo data
pnpm db:seed
```

### 5. Verify Installation

```bash
cd packages/db
pnpm tsx src/test-connection.ts
```

**You should see:**
- ✓ Database is connected
- ✓ Workspace: Acme Corporation
- ✓ Trial balance with 2 accounts (balanced)

## What You Just Built

### Infrastructure
- **PostgreSQL** (with TimescaleDB) on port 5432
- **Redpanda** (Kafka-compatible) on port 19092
- **Temporal** (workflows) on port 7233
- **Temporal UI** at http://localhost:8233
- **Redis** (caching) on port 6379

### Database
- **1 Workspace**: Acme Corporation
- **1 Entity**: Acme USA
- **2 Ledger Books**: LOCAL, GROUP
- **15 GL Accounts**: Full chart of accounts
- **1 Sample Journal**: Capital contribution ($100k)
- **Dimensions**: Department (ENG, SALES, MKT)
- **1 Vendor**: AWS
- **1 Customer**: Beta Corp
- **3 Roles**: Admin, Accountant, Viewer

### Verified
- Trial balance is balanced (DR = CR)
- Journal posting works
- Multi-book accounting works
- Audit trail captured

## Explore the Data

### Option 1: Prisma Studio (Visual)

```bash
cd packages/db
pnpm studio
```

Opens at http://localhost:5555

Browse all tables visually.

### Option 2: Raw SQL (psql)

```bash
# Connect to database
docker exec -it airp-postgres psql -U airp -d airp

# List tables
\dt

# Query accounts
SELECT code, name, type FROM accounts ORDER BY code;

# Query journals
SELECT "journalNumber", "journalDate", description, status FROM journals;

# Exit
\q
```

## Common Commands

```bash
# View service logs
make logs

# Stop services
make down

# Restart services
make restart

# Full reset (delete all data)
make clean

# Complete setup again
make demo
```

## What's Next?

1. **Build the API** (NestJS + tRPC)
2. **Build the Web App** (Next.js)
3. **Implement Posting Engine** (core business logic)
4. **Add Workflows** (Bank Rec, Close, AP/AR)
5. **Build Copilot** (AI query interface)

## Troubleshooting

### Services won't start?

```bash
# Check Docker is running
docker ps

# View specific service logs
docker-compose logs postgres
docker-compose logs temporal
```

### Database connection fails?

```bash
# Restart services
make restart

# Wait 30 seconds
# Try again
```

### Migration fails?

```bash
# Reset database
docker-compose down -v
make up
# Wait 30 seconds
pnpm db:migrate
```

### Need a clean slate?

```bash
make clean  # Removes everything
make demo   # Rebuilds from scratch
```

## Verification Checklist

- [ ] All Docker containers running: `docker-compose ps`
- [ ] Migrations completed: `pnpm db:migrate`
- [ ] Seed data loaded: `pnpm db:seed`
- [ ] Test connection passes: `cd packages/db && pnpm tsx src/test-connection.ts`
- [ ] Trial balance balanced: Totals match in test output
- [ ] Temporal UI accessible: http://localhost:8233

## Support

- **Full Testing Guide**: See `TESTING.md`
- **Docker Issues**: Check `docker-compose logs`
- **Database Issues**: Check `packages/db/` and connection string in `.env`

---

**Status**: Foundation complete and tested ✓

**Next Deliverable**: NestJS API + Posting Engine
