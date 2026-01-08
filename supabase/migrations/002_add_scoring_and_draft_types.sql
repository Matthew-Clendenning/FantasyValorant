-- Migration: Add scoring_type and draft_type columns to leagues table
-- Run this in the Supabase SQL Editor after the initial schema

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

CREATE TYPE scoring_type AS ENUM ('h2h_points', 'season_points', 'h2h_categories', 'rotisserie');
CREATE TYPE draft_type AS ENUM ('snake', 'auction');

-- ============================================================================
-- ALTER LEAGUES TABLE
-- ============================================================================

-- Add scoring_type column (defaults to h2h_points - most common fantasy format)
ALTER TABLE leagues
ADD COLUMN scoring_type scoring_type DEFAULT 'h2h_points' NOT NULL;

-- Add draft_type column (defaults to snake - most beginner-friendly)
ALTER TABLE leagues
ADD COLUMN draft_type draft_type DEFAULT 'snake' NOT NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_leagues_scoring_type ON leagues(scoring_type);
CREATE INDEX idx_leagues_draft_type ON leagues(draft_type);
