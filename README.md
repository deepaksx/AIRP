# AIRP

**AI-native financial ERP with NextDay Migration and unified append-only ledger**

AIRP is a modern, cloud-native accounting platform designed for mid-market companies that need powerful GL + operational accounting with radical automation, multi-entity consolidation, and intelligent workflows.

## 🚀 **NEW USER? START HERE**: [START-HERE.md](./START-HERE.md)

## Core Features

- **Unified Ledger**: Append-only, immutable journal with multi-entity, multi-currency, multi-book support
- **NextDay Migration**: Import from QuickBooks, Xero, NetSuite, or CSV with deterministic reconciliation
- **Accounting Intelligence**: OCR capture, auto-categorization, anomaly detection, predictive analytics, and AI Copilot
- **Control Layer**: SoD policies, multi-level approvals, period locks, field-level permissions, comprehensive audit trails
- **Workflows**: Month-end close, bank reconciliation, AP/AR cycles, intercompany netting/eliminations
- **Native Integrations**: 13k+ bank feeds, Ramp, Rippling, Bill.com, Salesforce

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url> airp
cd airp
cp .env.example .env
pnpm install
```

### 2. Start Services

```bash
make demo
```

This will:
- Start PostgreSQL, Redpanda (Kafka), Temporal, Redis via Docker Compose
- Run database migrations
- Seed demo data (sample entity, COA, transactions)

### 3. Start Development Servers

```bash
make dev
```

Access:
- **Web UI**: http://localhost:3000
- **API**: http://localhost:3001
- **Temporal UI**: http://localhost:8233

## Repository Structure

```
/airp
  /apps
    /api          # NestJS REST + tRPC API
    /web          # Next.js frontend (App Router)
    /workers      # Temporal workflow workers
  /packages
    /db           # Prisma schema, migrations, seeds
    /core         # Domain services: posting engine, FX, etc.
    /controls     # Policies, approvals, SoD, period locks
    /workflows    # Close, bank rec, AP/AR, intercompany
    /ai           # Copilot, categorization, anomaly detection
    /integrations # Bank feeds, OCR, third-party APIs
    /common       # Shared types, Zod schemas, utilities
    /auth         # Authentication/authorization, RLS helpers
  /infra
    /docker       # Local development compose + init scripts
    /terraform    # Production infrastructure (stubs)
    /helm         # Kubernetes charts (stubs)
  /scripts        # Utility scripts
  /docs           # Architecture, API, runbooks
```

## Key Commands

| Command          | Description                                    |
|------------------|------------------------------------------------|
| `make help`      | Show all available commands                    |
| `make up`        | Start Docker services                          |
| `make down`      | Stop Docker services                           |
| `make dev`       | Start development servers                      |
| `make migrate`   | Run database migrations                        |
| `make seed`      | Seed database with demo data                   |
| `make test`      | Run all tests                                  |
| `make e2e`       | Run end-to-end tests                           |
| `make demo`      | Full demo setup (up + migrate + seed)          |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and data flow
- [Unified Ledger](./docs/LEDGER.md) - Posting engine, balancing rules, subledgers
- [Control Layer](./docs/CONTROLS.md) - Policies, approvals, SoD, audit
- [Workflows](./docs/WORKFLOWS.md) - Month-end, bank rec, AP/AR, intercompany
- [AI Modules](./docs/AI.md) - Copilot, auto-categorization, anomaly detection
- [Migration](./docs/MIGRATION.md) - NextDay Migration architecture and adapters
- [API Reference](./docs/API.md) - REST + tRPC endpoints, auth, scoping
- [Security](./docs/SECURITY.md) - RLS, encryption, compliance features
- [Runbook](./docs/RUNBOOK.md) - Deployment, monitoring, troubleshooting

## Technology Stack

- **Backend**: TypeScript, NestJS, Prisma, PostgreSQL (TimescaleDB), Kafka/Redpanda, Temporal
- **Frontend**: Next.js 15, React, Tailwind CSS, shadcn/ui, TanStack Query, Recharts
- **Auth**: OAuth/OIDC, JWT, RLS + ABAC
- **Observability**: OpenTelemetry, Prometheus, Grafana, Sentry
- **Infrastructure**: Docker, Terraform, Helm, GitHub Actions

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `make test`
4. Commit with descriptive message
5. Push and create PR

## Testing

- **Unit tests**: `pnpm test` (Vitest/Jest)
- **Integration tests**: `pnpm test -- --integration`
- **E2E tests**: `make e2e` (Playwright)
- **Load tests**: `pnpm --filter @airp/api test:load` (k6)

## Performance Targets

- **Read paths**: <200ms p95 for common queries (trial balance, ledger drill)
- **Write paths**: <500ms p95 for journal posting
- **Scalability**: Designed for 40B+ journal lines via partitioning and streaming ingestion

## Security & Compliance

- Row-level security (PostgreSQL RLS + app ABAC)
- Field-level permissions and data masking
- Comprehensive audit logging
- Tamper-evident ledger (Merkle hash chain)
- SoD enforcement
- IFRS/ASC-606 revenue recognition support

## License

Proprietary. All rights reserved.

## Support

For issues and feature requests, please contact your account manager or create an issue in the internal tracker.
