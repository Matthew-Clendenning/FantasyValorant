-- Fantasy Valorant Database Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/jbpcwwpuabqcbzfkdonc/sql

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE player_role AS ENUM ('duelist', 'initiator', 'controller', 'sentinel', 'flex');
CREATE TYPE league_type AS ENUM ('public', 'private');
CREATE TYPE draft_format AS ENUM ('snake');
CREATE TYPE draft_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Pro Valorant teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    logo_url TEXT,
    region TEXT NOT NULL,
    vlr_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pro Valorant players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ign TEXT NOT NULL,
    real_name TEXT,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    role player_role NOT NULL,
    is_igl BOOLEAN DEFAULT FALSE NOT NULL,
    country TEXT,
    photo_url TEXT,
    vlr_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Scoring configurations
CREATE TABLE scoring_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    kill_points DECIMAL(5,2) DEFAULT 3.0 NOT NULL,
    death_points DECIMAL(5,2) DEFAULT -1.0 NOT NULL,
    assist_points DECIMAL(5,2) DEFAULT 1.5 NOT NULL,
    acs_multiplier DECIMAL(5,4) DEFAULT 0.02 NOT NULL,
    first_kill_points DECIMAL(5,2) DEFAULT 2.0 NOT NULL,
    first_death_points DECIMAL(5,2) DEFAULT -1.0 NOT NULL,
    clutch_points DECIMAL(5,2) DEFAULT 3.0 NOT NULL,
    ace_points DECIMAL(5,2) DEFAULT 5.0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fantasy leagues
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type league_type DEFAULT 'private' NOT NULL,
    draft_format draft_format DEFAULT 'snake' NOT NULL,
    max_teams INTEGER DEFAULT 8 NOT NULL,
    roster_size INTEGER DEFAULT 6 NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    invite_code TEXT UNIQUE,
    draft_date TIMESTAMPTZ,
    draft_status draft_status DEFAULT 'pending' NOT NULL,
    scoring_config_id UUID REFERENCES scoring_configs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT max_teams_range CHECK (max_teams >= 2 AND max_teams <= 16),
    CONSTRAINT roster_size_range CHECK (roster_size >= 5 AND roster_size <= 10),
    CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 50)
);

-- League memberships
CREATE TABLE league_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    team_name TEXT NOT NULL,
    draft_position INTEGER,
    is_commissioner BOOLEAN DEFAULT FALSE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_league_member UNIQUE (league_id, user_id),
    CONSTRAINT team_name_length CHECK (char_length(team_name) >= 3 AND char_length(team_name) <= 30)
);

-- Pro matches for scoring
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    tournament_name TEXT NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    status match_status DEFAULT 'scheduled' NOT NULL,
    team_a_score INTEGER,
    team_b_score INTEGER,
    vlr_match_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT different_teams CHECK (team_a_id != team_b_id)
);

-- Player statistics (per match)
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    acs DECIMAL(6,2) NOT NULL,
    kills INTEGER NOT NULL,
    deaths INTEGER NOT NULL,
    assists INTEGER NOT NULL,
    adr DECIMAL(6,2) NOT NULL,
    kast DECIMAL(5,2),
    first_kills INTEGER DEFAULT 0 NOT NULL,
    first_deaths INTEGER DEFAULT 0 NOT NULL,
    headshot_pct DECIMAL(5,2),
    clutches_won INTEGER DEFAULT 0 NOT NULL,
    clutches_played INTEGER DEFAULT 0 NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT positive_stats CHECK (kills >= 0 AND deaths >= 0 AND assists >= 0),
    CONSTRAINT valid_clutches CHECK (clutches_won <= clutches_played)
);

-- User rosters within leagues
CREATE TABLE rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_member_id UUID REFERENCES league_members(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    slot TEXT NOT NULL,
    is_starter BOOLEAN DEFAULT TRUE NOT NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_roster_player UNIQUE (league_member_id, player_id)
);

-- Draft picks history
CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    round INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    picked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_draft_pick UNIQUE (league_id, pick_number),
    CONSTRAINT unique_player_in_draft UNIQUE (league_id, player_id),
    CONSTRAINT positive_round CHECK (round > 0),
    CONSTRAINT positive_pick CHECK (pick_number > 0)
);

-- Fantasy scores per week
CREATE TABLE fantasy_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_member_id UUID REFERENCES league_members(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    total_points DECIMAL(10,2) NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_weekly_score UNIQUE (league_member_id, week_number),
    CONSTRAINT positive_week CHECK (week_number > 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);

-- Teams
CREATE INDEX idx_teams_region ON teams(region);
CREATE INDEX idx_teams_vlr_id ON teams(vlr_id);

-- Players
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_role ON players(role);
CREATE INDEX idx_players_vlr_id ON players(vlr_id);
CREATE INDEX idx_players_ign ON players(ign);

-- Leagues
CREATE INDEX idx_leagues_owner_id ON leagues(owner_id);
CREATE INDEX idx_leagues_type ON leagues(type);
CREATE INDEX idx_leagues_invite_code ON leagues(invite_code);
CREATE INDEX idx_leagues_draft_status ON leagues(draft_status);

-- League members
CREATE INDEX idx_league_members_league_id ON league_members(league_id);
CREATE INDEX idx_league_members_user_id ON league_members(user_id);

-- Matches
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_matches_team_a ON matches(team_a_id);
CREATE INDEX idx_matches_team_b ON matches(team_b_id);

-- Player stats
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_stats_match_id ON player_stats(match_id);
CREATE INDEX idx_player_stats_recorded_at ON player_stats(recorded_at);

-- Rosters
CREATE INDEX idx_rosters_league_member_id ON rosters(league_member_id);
CREATE INDEX idx_rosters_player_id ON rosters(player_id);

-- Draft picks
CREATE INDEX idx_draft_picks_league_id ON draft_picks(league_id);
CREATE INDEX idx_draft_picks_user_id ON draft_picks(user_id);

-- Fantasy scores
CREATE INDEX idx_fantasy_scores_league_member_id ON fantasy_scores(league_member_id);
CREATE INDEX idx_fantasy_scores_week ON fantasy_scores(week_number);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_scores ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Teams policies (public read, admin write)
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

-- Players policies (public read, admin write)
CREATE POLICY "Players are viewable by everyone"
    ON players FOR SELECT
    USING (true);

-- Scoring configs policies
CREATE POLICY "Scoring configs are viewable by everyone"
    ON scoring_configs FOR SELECT
    USING (true);

-- Leagues policies
CREATE POLICY "Public leagues are viewable by everyone"
    ON leagues FOR SELECT
    USING (
        type = 'public'
        OR owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.league_id = leagues.id
            AND league_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create leagues"
    ON leagues FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "League owners can update their leagues"
    ON leagues FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "League owners can delete their leagues"
    ON leagues FOR DELETE
    USING (auth.uid() = owner_id);

-- League members policies
CREATE POLICY "League members are viewable by league participants"
    ON league_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leagues
            WHERE leagues.id = league_members.league_id
            AND (
                leagues.type = 'public'
                OR leagues.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM league_members lm
                    WHERE lm.league_id = leagues.id
                    AND lm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can join leagues"
    ON league_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
    ON league_members FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leagues"
    ON league_members FOR DELETE
    USING (auth.uid() = user_id);

-- Matches policies (public read)
CREATE POLICY "Matches are viewable by everyone"
    ON matches FOR SELECT
    USING (true);

-- Player stats policies (public read)
CREATE POLICY "Player stats are viewable by everyone"
    ON player_stats FOR SELECT
    USING (true);

-- Rosters policies
CREATE POLICY "Rosters are viewable by league participants"
    ON rosters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members lm
            JOIN leagues l ON l.id = lm.league_id
            WHERE lm.id = rosters.league_member_id
            AND (
                l.type = 'public'
                OR l.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM league_members lm2
                    WHERE lm2.league_id = l.id
                    AND lm2.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage own roster"
    ON rosters FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.id = rosters.league_member_id
            AND league_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own roster"
    ON rosters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.id = rosters.league_member_id
            AND league_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete from own roster"
    ON rosters FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM league_members
            WHERE league_members.id = rosters.league_member_id
            AND league_members.user_id = auth.uid()
        )
    );

-- Draft picks policies
CREATE POLICY "Draft picks are viewable by league participants"
    ON draft_picks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leagues l
            WHERE l.id = draft_picks.league_id
            AND (
                l.type = 'public'
                OR l.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM league_members lm
                    WHERE lm.league_id = l.id
                    AND lm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can make draft picks"
    ON draft_picks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Fantasy scores policies
CREATE POLICY "Fantasy scores are viewable by league participants"
    ON fantasy_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM league_members lm
            JOIN leagues l ON l.id = lm.league_id
            WHERE lm.id = fantasy_scores.league_member_id
            AND (
                l.type = 'public'
                OR l.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM league_members lm2
                    WHERE lm2.league_id = l.id
                    AND lm2.user_id = auth.uid()
                )
            )
        )
    );

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default scoring configuration
INSERT INTO scoring_configs (name, kill_points, death_points, assist_points, acs_multiplier, first_kill_points, first_death_points, clutch_points, ace_points)
VALUES ('Standard', 3.0, -1.0, 1.5, 0.02, 2.0, -1.0, 3.0, 5.0);
