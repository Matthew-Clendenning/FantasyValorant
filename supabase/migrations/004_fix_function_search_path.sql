-- Migration: Fix function search_path security warnings
-- This fixes the "Function has a role mutable search_path" warnings in Supabase Security Advisor
-- Safe to run on existing database - CREATE OR REPLACE just updates existing functions

-- ============================================================================
-- FIX FUNCTIONS FROM 001_initial_schema.sql
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- FIX FUNCTIONS FROM 003_fix_league_members_rls.sql
-- ============================================================================

-- Check if user owns a league (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_owner(league_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.leagues
        WHERE id = league_id AND owner_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Check if user is a member of a league (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_member(league_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.league_members
        WHERE public.league_members.league_id = $1 AND public.league_members.user_id = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Check if league is public (bypasses RLS)
CREATE OR REPLACE FUNCTION is_league_public(league_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.leagues
        WHERE id = league_id AND type = 'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
