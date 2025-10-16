#!/bin/bash
# AIRP Setup Test Script for Unix/Linux/macOS
# This script tests the complete AIRP setup

set -e  # Exit on error

echo "========================================"
echo "AIRP Setup Test Script"
echo "========================================"
echo ""

echo "[1/7] Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found. Please install Node.js 20+"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "ERROR: pnpm not found. Please install pnpm 8+"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker not found. Please install Docker"; exit 1; }
echo "✓ All prerequisites found"
echo ""

echo "[2/7] Checking .env file..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi
echo "✓ .env file exists"
echo ""

echo "[3/7] Installing dependencies..."
pnpm install
echo "✓ Dependencies installed"
echo ""

echo "[4/7] Starting Docker services..."
docker-compose up -d
echo "✓ Docker services started"
echo "Waiting 30 seconds for services to initialize..."
sleep 30
echo ""

echo "[5/7] Generating Prisma client..."
pnpm db:generate
echo "✓ Prisma client generated"
echo ""

echo "[6/7] Running database migrations..."
pnpm db:migrate -- --name init
echo "✓ Migrations completed"
echo ""

echo "[7/7] Seeding demo data..."
pnpm db:seed
echo "✓ Demo data seeded"
echo ""

echo "========================================"
echo "ALL TESTS PASSED!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Run 'cd packages/db && pnpm tsx src/test-connection.ts' to verify"
echo "  2. Run 'make dev' to start development servers"
echo "  3. Open Prisma Studio: 'cd packages/db && pnpm studio'"
echo ""
echo "Service URLs:"
echo "  - Temporal UI: http://localhost:8233"
echo "  - Prisma Studio: http://localhost:5555 (when running)"
echo ""
