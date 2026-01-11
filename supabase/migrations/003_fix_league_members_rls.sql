-- Fix: Infinite recursion in RLS policies
-- Problem: leagues policy checks league_members, league_members policy checks leagues
-- Solution: Use SECURITY DEFINER functions to bypass RLS for internal checks

-- ============================================================================
-- STEP 1: Create helper functions that bypass RLS
-- ============================================================================

-- Check if user owns a league (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_owner(league_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM leagues
        WHERE id = league_id AND owner_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a member of a league (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_member(league_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM league_members
        WHERE league_members.league_id = $1 AND league_members.user_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if league is public (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_public(league_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM leagues
        WHERE id = league_id AND type = 'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Drop all existing problematic policies
-- ============================================================================

DROP POLICY IF EXISTS "League members are viewable by league participants" ON league_members;
DROP POLICY IF EXISTS "League members are viewable" ON league_members;
DROP POLICY IF EXISTS "Public leagues are viewable by everyone" ON leagues;
DROP POLICY IF EXISTS "Leagues are viewable" ON leagues;

-- ============================================================================
-- STEP 3: Create new non-recursive policies using helper functions
-- ============================================================================

-- Leagues SELECT policy (uses function to check membership, avoiding recursion)
CREATE POLICY "Leagues are viewable"
    ON leagues FOR SELECT
    USING (
        type = 'public'
        OR owner_id = auth.uid()
        OR is_league_member(id, auth.uid())
    );

-- League members SELECT policy (uses function to check ownership, avoiding recursion)
CREATE POLICY "League members are viewable"
    ON league_members FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_league_owner(league_id, auth.uid())
        OR is_league_public(league_id)
    );
