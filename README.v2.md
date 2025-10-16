# AIRP v2.0 - AI-Native Financial ERP

**Autonomous Intelligent Resource Planning for Finance**

Version 2.0.0 | Built for CFOs, Controllers, Treasurers & Auditors | Optimized for Dubai/UAE (UTC+4)

---

## Executive Summary

AIRP v2 is an **AI-native Financial ERP** designed from the ground up for autonomous finance operations. Unlike traditional ERPs that bolt AI onto legacy architectures, AIRP v2 uses AI as its core operating system for financial processes.

### What Makes It AI-Native

- **Continuous Close**: Predictive accruals and soft-close snapshots eliminate month-end crunch
- **Autonomous Reconciliation**: ML-powered bank and subledger matching with confidence scoring
- **Auto-Accounting**: LLM+rules hybrid automatically proposes journal entries from documents
- **Narrative Financials**: Natural language explanations of every variance and trend
- **Reasoning Over Policy**: RAG system queries IFRS/GAAP/VAT rules to ensure compliance
- **Self-Healing**: Anomaly detection flags issues before they cascade

### Who It's For

- **CFOs** who want real-time insights without waiting for close
- **Controllers** drowning in manual accruals and reconciliations
- **Treasurers** needing accurate cash forecasts and FX management
- **Auditors** requiring complete audit trails with explainable AI decisions
- **FP&A Teams** building scenarios and driver-based models

### Architecture Highlights

- **Event-Sourced Ledger**: Immutable append-only events with projections
- **Explainable AI**: Every AI decision includes trace, confidence, and alternatives
- **Multi-Entity/Currency**: Full consolidation with CTA and intercompany elimination
- **Compliance-First**: IFRS primary, GAAP configurable, UAE VAT 5%, ZATCA/EFRIS ready
- **Cloud-Native**: Kubernetes-ready microservices with event-driven architecture

---

## Quick Start (5 Minutes)

### Prerequisites
- Docker Desktop with 8GB RAM
- Docker Compose v2.x
- Ports available: 5432 (Postgres), 9092 (Kafka), 8080 (Gateway), 3000 (Web UI)

### Launch the System

```bash
# Clone the repository
git clone https://github.com/deepaksx/AIRP.git
cd AIRP

# Start all services (Postgres, Kafka, API Gateway, AI Services)
docker compose up -d

# Wait for health checks (30-60 seconds)
docker compose ps

# Load synthetic demo data
docker compose exec api-gateway npm run seed:demo

# Open the web UI
open http://localhost:3000
```

### Demo Workflow (Autonomous AP Invoice Processing)

```bash
# 1. Upload a vendor invoice (OCR extracts data)
curl -X POST http://localhost:8080/api/v1/ap/invoices \
  -H "Content-Type: multipart/form-data" \
  -F "file=@examples/synthetic_data/invoice_001.pdf" \
  -F "entity_id=AED_ENTITY_01"

# Response includes auto-proposed journal entry with confidence score

# 2. AI auto-accounts the invoice (GL codes, tax, terms)
# Returns: {
#   "invoice_id": "INV-2025-001",
#   "proposed_entries": [{
#     "account": "5100-COGS",
#     "debit": 10500,
#     "confidence": 0.94,
#     "reasoning": "Historical vendor pattern + PO line item category"
#   }],
#   "approval_required": false  # High confidence = auto-post
# }

# 3. Check ledger events (immutable audit trail)
curl http://localhost:8080/api/v1/ledger/events?invoice_id=INV-2025-001

# 4. View narrative report
curl http://localhost:8080/api/v1/reports/narrative/monthly \
  | jq '.sections[] | select(.title=="AP Analysis")'

# Output: "OPEX increased 12% MoM driven by $47K in new SaaS subscriptions
#          (Vendor: AWS, Azure). This aligns with Q1 cloud migration plan."
```

---

## Repository Structure

```
AIRP/
├── README.md                      # This file
├── package.json                   # v2.0.0
├── docker-compose.yml             # Full stack orchestration
│
├── docs/                          # Architecture & Design
│   ├── architecture.md            # C4 diagrams + data flows
│   ├── ai_design.md              # AI services, prompts, evals
│   ├── deployment.md             # K8s, scaling, DR
│   └── compliance.md             # IFRS, GAAP, VAT, audit
│
├── apis/openapi/                  # OpenAPI 3.1 Specifications
│   ├── ledger.yaml               # Immutable event store
│   ├── ap.yaml                   # Accounts Payable
│   ├── ar.yaml                   # Accounts Receivable
│   ├── treasury.yaml             # Cash, FX, hedging
│   ├── fpna.yaml                 # Planning & Forecasting
│   ├── policy.yaml               # Policy as code
│   └── auth.yaml                 # OIDC, RBAC/ABAC
│
├── schemas/                       # Data Contracts
│   ├── sql/ddl.sql               # Postgres event store + projections
│   ├── avro/                     # Kafka event schemas
│   ├── jsonschema/               # API validation
│   └── vector/                   # Embeddings for RAG
│
├── services/                      # Microservices
│   ├── api-gateway/              # NestJS - routing, auth
│   ├── ledger-writer/            # TS - exactly-once writes
│   ├── projection-service/       # TS - materialized views
│   ├── ap-service/               # TS - AP workflow
│   ├── ar-service/               # TS - AR workflow
│   ├── treasury-service/         # TS - cash, FX
│   ├── ai-auto-accounting/       # Python - LLM entry proposal
│   ├── ai-recon/                 # Python - reconciliation ML
│   ├── ai-forecast/              # Python - cash forecast
│   ├── ai-narrative/             # Python - report generation
│   └── ai-policy-advisor/        # Python - RAG over IFRS/VAT
│
├── infra/                         # Infrastructure as Code
│   ├── docker-compose.yml        # Local dev environment
│   ├── k8s/                      # Kubernetes manifests
│   ├── terraform/                # Cloud provisioning (AWS/Azure)
│   └── github-actions/           # CI/CD pipelines
│
├── policy/                        # Policy as Code
│   ├── rego/                     # OPA policies (approval, SoD)
│   ├── ifrs/                     # IFRS mapping tables
│   └── vat/                      # UAE VAT 5%, ZATCA stubs
│
├── connectors/                    # External Integrations
│   ├── banks/                    # ISO20022, SWIFT
│   ├── tax/                      # E-invoicing (ZATCA, EFRIS)
│   └── ocr/                      # Document extraction
│
├── ml/                            # Machine Learning
│   ├── feature_store/            # Feature engineering
│   ├── model_registry/           # MLflow integration
│   ├── notebooks/                # Training experiments
│   └── eval/                     # Model evaluation harness
│
├── security/                      # Security & Compliance
│   ├── threat_model.md           # STRIDE analysis
│   ├── data_classification.md    # PII, confidential
│   ├── key_management.md         # KMS, rotation
│   └── sod_matrix.csv            # Segregation of Duties
│
├── playbooks/                     # Operational Runbooks
│   ├── runbook_close.md          # Month-end close
│   ├── incident_response.md      # DR/incident handling
│   └── audit_support.md          # Audit preparation
│
├── examples/                      # Demo Data & Scripts
│   ├── synthetic_data/           # CSV test datasets
│   ├── prompts/                  # AI prompt templates
│   └── postman/                  # API test collection
│
└── tests/                         # Test Suites
    ├── unit/                     # Service unit tests
    ├── integration/              # E2E scenarios
    └── golden/                   # AI explainability baselines
```

---

## Key Features

### Financial Modules

| Module | Capabilities |
|--------|-------------|
| **General Ledger** | Event-sourced immutable ledger, multi-dimensional COA, unlimited segments, real-time trial balance |
| **AP** | 3-way match, auto-accounting, payment proposals, vendor aging, early payment discounts |
| **AR** | Invoicing, cash application with fuzzy matching, aging, dunning, credit management |
| **Treasury** | Multi-currency cash positions, FX deals, hedge accounting, liquidity forecasting |
| **Fixed Assets** | Capitalization rules, depreciation (SL, DB, custom), impairment, disposal tracking |
| **Consolidation** | Multi-entity, intercompany elimination, CTA, topside adjustments, audit packs |
| **FP&A** | Driver-based planning, scenario modeling, write-back, variance analysis, rolling forecasts |
| **Tax** | UAE VAT 5%, multi-jurisdictional, e-invoicing (ZATCA ready), deferred tax tracking |

### AI Capabilities

| Service | Function | Confidence Threshold |
|---------|----------|---------------------|
| **Auto-Accounting** | Maps transactions to GL codes using LLM + historical patterns | 0.85 = auto-post |
| **Reconciliation** | Matches bank statements to ledger with fuzzy logic + ML | 0.90 = auto-post |
| **Cash Forecasting** | 90-day rolling forecast using time-series + drivers | MAPE < 10% |
| **Narrative Reports** | Generates executive summaries of financial performance | Factuality check |
| **Policy Advisor** | RAG over IFRS/GAAP/VAT rules for compliance questions | Citation required |
| **Anomaly Detection** | Flags unusual transactions, duplicate invoices, fraud | 0.95 = alert |

### Non-Functional Attributes

- **Performance**: P99 < 300ms (read), < 800ms (write), 99.9% uptime
- **Scale**: Handles 1M+ transactions/month, 100+ entities, 50+ currencies
- **Security**: RBAC+ABAC, SoD policies, encryption at rest/transit, audit trails
- **Compliance**: IFRS-first, GAAP configurable, SOX controls, audit-ready
- **Observability**: OpenTelemetry traces, Prometheus metrics, structured logs
- **Recovery**: RPO 15min, RTO 60min, point-in-time restore

---

## Technology Stack

### Core Platform
- **Languages**: TypeScript (services), Python (AI), SQL (Postgres)
- **Frameworks**: NestJS (APIs), FastAPI (AI), React (UI)
- **Database**: PostgreSQL 15+ (event store + projections)
- **Messaging**: Apache Kafka / Redpanda (event bus)
- **Cache**: Redis (sessions, query cache)
- **Search**: Elasticsearch (audit logs, document search)

### AI/ML Stack
- **LLMs**: OpenAI GPT-4 / Anthropic Claude (auto-accounting, narrative)
- **Embeddings**: OpenAI text-embedding-3 (RAG, semantic search)
- **Vector DB**: pgvector / Qdrant (policy knowledge base)
- **ML Framework**: scikit-learn, XGBoost (classification, anomaly detection)
- **Time Series**: Prophet, ARIMA (cash forecasting)
- **Feature Store**: Feast (feature engineering)
- **Model Registry**: MLflow (versioning, deployment)

### Infrastructure
- **Orchestration**: Kubernetes (EKS/AKS/GKE)
- **Service Mesh**: Istio (mTLS, observability)
- **API Gateway**: Kong / Nginx Ingress
- **Auth**: Keycloak (OIDC, SAML, SCIM)
- **Observability**: Grafana, Tempo, Loki, Prometheus
- **CI/CD**: GitHub Actions, ArgoCD

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://airp:password@localhost:5432/airp_v2
EVENT_STORE_URL=postgresql://airp:password@localhost:5432/events

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_PREFIX=airp.v2

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Auth
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=airp
KEYCLOAK_CLIENT_ID=airp-api

# Region & Compliance
DEFAULT_TIMEZONE=Asia/Dubai
BASE_CURRENCY=AED
IFRS_VERSION=2024
VAT_RATE_UAE=0.05

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
LOG_LEVEL=info
```

### Multi-Tenancy

Each entity gets isolated:
- Postgres schemas: `entity_{id}`
- Kafka topics: `airp.v2.{entity_id}.{domain}`
- Object storage: `s3://airp-prod/{entity_id}/`
- Encryption: Separate KMS keys per entity

---

## Development

### Local Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start infrastructure
docker compose up -d postgres kafka redis

# Run migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Start services (development mode)
pnpm dev:api      # API Gateway + services
pnpm dev:ai       # AI services
pnpm dev:web      # Web UI

# Run tests
pnpm test
pnpm test:e2e
pnpm test:ai:eval
```

### Adding a New AI Service

1. Create service in `/services/ai-{name}/`
2. Define pydantic models for input/output
3. Add OpenAI function-call schema
4. Implement prompt template with examples
5. Add confidence scoring logic
6. Create evaluation dataset
7. Register in model registry
8. Add to docker-compose.yml

---

## API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8080/api/docs
- **ReDoc**: http://localhost:8080/api/redoc
- **OpenAPI JSON**: http://localhost:8080/api/openapi.json

### Authentication

```bash
# Get access token
curl -X POST http://localhost:8180/realms/airp/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=airp-api \
  -d username=controller@demo.com \
  -d password=demo123

# Use token in requests
curl http://localhost:8080/api/v1/ledger/balance \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Deployment

### Production Checklist

- [ ] Rotate all secrets and API keys
- [ ] Enable TLS for all endpoints
- [ ] Configure backup retention (7 days hot, 90 days cold)
- [ ] Set up monitoring alerts (PagerDuty/Slack)
- [ ] Run security scan (Trivy, Snyk)
- [ ] Load test with expected peak traffic
- [ ] Enable audit logging to SIEM
- [ ] Review RBAC policies
- [ ] Test disaster recovery runbook
- [ ] Document custom integrations

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace airp-prod

# Apply secrets (use Sealed Secrets in real deployment)
kubectl apply -f infra/k8s/secrets/

# Deploy services
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress/

# Check status
kubectl -n airp-prod get pods
kubectl -n airp-prod logs -f deployment/api-gateway
```

---

## Roadmap

### v2.1 (Q2 2025)
- [ ] Budgeting module with workflow approvals
- [ ] Advanced consolidation (minority interest, equity method)
- [ ] Multi-book accounting (IFRS + local GAAP)
- [ ] E-invoicing integration (ZATCA Phase 2)

### v2.2 (Q3 2025)
- [ ] Procurement module with PO matching
- [ ] Expense management with receipt OCR
- [ ] Contract lifecycle management
- [ ] Advanced cash forecasting (Monte Carlo)

### v2.3 (Q4 2025)
- [ ] Revenue recognition (IFRS 15 / ASC 606)
- [ ] Lease accounting (IFRS 16 / ASC 842)
- [ ] Transfer pricing automation
- [ ] Blockchain-based audit trail

---

## Support & Community

- **Documentation**: https://docs.airp.dev
- **GitHub Issues**: https://github.com/deepaksx/AIRP/issues
- **Slack Community**: https://airp-community.slack.com
- **Email**: support@airp.dev

---

## License

AIRP v2 is released under the **MIT License**.

Copyright (c) 2025 AIRP Contributors

---

## Acknowledgments

Built with:
- OpenAI GPT-4 for auto-accounting intelligence
- PostgreSQL for rock-solid event sourcing
- NestJS for elegant TypeScript microservices
- FastAPI for blazing-fast AI inference
- Kubernetes for cloud-native scalability

**Architected for the future of finance.**

---

**Version**: 2.0.0
**Build Date**: 2025-01-16
**Architecture**: AI-Native Event-Sourced Microservices
**Region**: Dubai/UAE (UTC+4)
**Compliance**: IFRS, UAE VAT, ZATCA-ready
