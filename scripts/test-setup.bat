@echo off
REM AIRP Setup Test Script for Windows
REM This script tests the complete AIRP setup

echo ========================================
echo AIRP Setup Test Script
echo ========================================
echo.

echo [1/7] Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 20+
    exit /b 1
)
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pnpm not found. Please install pnpm 8+
    exit /b 1
)
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found. Please install Docker Desktop
    exit /b 1
)
echo OK: All prerequisites found
echo.

echo [2/7] Checking .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)
echo OK: .env file exists
echo.

echo [3/7] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [4/7] Starting Docker services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    exit /b 1
)
echo OK: Docker services started
echo Waiting 30 seconds for services to initialize...
timeout /t 30 /nobreak >nul
echo.

echo [5/7] Generating Prisma client...
call pnpm db:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    exit /b 1
)
echo OK: Prisma client generated
echo.

echo [6/7] Running database migrations...
call pnpm db:migrate -- --name init
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    exit /b 1
)
echo OK: Migrations completed
echo.

echo [7/7] Seeding demo data...
call pnpm db:seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed data
    exit /b 1
)
echo OK: Demo data seeded
echo.

echo ========================================
echo ALL TESTS PASSED!
echo ========================================
echo.
echo Next steps:
echo   1. Run 'cd packages\db && pnpm tsx src\test-connection.ts' to verify
echo   2. Run 'make dev' to start development servers
echo   3. Open Prisma Studio: 'cd packages\db && pnpm studio'
echo.
echo Service URLs:
echo   - Temporal UI: http://localhost:8233
echo   - Prisma Studio: http://localhost:5555 (when running)
echo.
