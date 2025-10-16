-- AIRP Database Initialization
-- This script runs automatically when the PostgreSQL container first starts

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create schema if needed (Prisma uses 'public' by default)
-- Additional extensions for future use
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'AIRP database initialized successfully';
END $$;
