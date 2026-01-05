/**
 * Database types for Fantasy Valorant
 *
 * These types can be auto-generated using the Supabase CLI:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 *
 * For now, we define the expected schema manually.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Player roles in Valorant */
export type PlayerRole = "duelist" | "initiator" | "controller" | "sentinel" | "flex";

/** League visibility */
export type LeagueType = "public" | "private";

/** Draft format */
export type DraftFormat = "snake";

/** Draft status */
export type DraftStatus = "pending" | "in_progress" | "completed";

/** Match status */
export type MatchStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      /** User profiles extending Supabase auth */
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };

      /** Pro Valorant teams */
      teams: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          logo_url: string | null;
          region: string;
          vlr_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          logo_url?: string | null;
          region: string;
          vlr_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          short_name?: string;
          logo_url?: string | null;
          region?: string;
          vlr_id?: string | null;
          updated_at?: string;
        };
      };

      /** Pro Valorant players */
      players: {
        Row: {
          id: string;
          ign: string;
          real_name: string | null;
          team_id: string | null;
          role: PlayerRole;
          is_igl: boolean;
          country: string | null;
          photo_url: string | null;
          vlr_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ign: string;
          real_name?: string | null;
          team_id?: string | null;
          role: PlayerRole;
          is_igl?: boolean;
          country?: string | null;
          photo_url?: string | null;
          vlr_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ign?: string;
          real_name?: string | null;
          team_id?: string | null;
          role?: PlayerRole;
          is_igl?: boolean;
          country?: string | null;
          photo_url?: string | null;
          vlr_id?: string | null;
          updated_at?: string;
        };
      };

      /** Player statistics (historical and per-match) */
      player_stats: {
        Row: {
          id: string;
          player_id: string;
          match_id: string | null;
          acs: number;
          kills: number;
          deaths: number;
          assists: number;
          adr: number;
          kast: number | null;
          first_kills: number;
          first_deaths: number;
          headshot_pct: number | null;
          clutches_won: number;
          clutches_played: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          match_id?: string | null;
          acs: number;
          kills: number;
          deaths: number;
          assists: number;
          adr: number;
          kast?: number | null;
          first_kills?: number;
          first_deaths?: number;
          headshot_pct?: number | null;
          clutches_won?: number;
          clutches_played?: number;
          recorded_at?: string;
        };
        Update: {
          player_id?: string;
          match_id?: string | null;
          acs?: number;
          kills?: number;
          deaths?: number;
          assists?: number;
          adr?: number;
          kast?: number | null;
          first_kills?: number;
          first_deaths?: number;
          headshot_pct?: number | null;
          clutches_won?: number;
          clutches_played?: number;
        };
      };

      /** Fantasy leagues */
      leagues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: LeagueType;
          draft_format: DraftFormat;
          max_teams: number;
          roster_size: number;
          owner_id: string;
          invite_code: string | null;
          draft_date: string | null;
          draft_status: DraftStatus;
          scoring_config_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: LeagueType;
          draft_format?: DraftFormat;
          max_teams?: number;
          roster_size?: number;
          owner_id: string;
          invite_code?: string | null;
          draft_date?: string | null;
          draft_status?: DraftStatus;
          scoring_config_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: LeagueType;
          draft_format?: DraftFormat;
          max_teams?: number;
          roster_size?: number;
          invite_code?: string | null;
          draft_date?: string | null;
          draft_status?: DraftStatus;
          scoring_config_id?: string | null;
          updated_at?: string;
        };
      };

      /** League memberships */
      league_members: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          team_name: string;
          draft_position: number | null;
          is_commissioner: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          user_id: string;
          team_name: string;
          draft_position?: number | null;
          is_commissioner?: boolean;
          joined_at?: string;
        };
        Update: {
          team_name?: string;
          draft_position?: number | null;
          is_commissioner?: boolean;
        };
      };

      /** User rosters within leagues */
      rosters: {
        Row: {
          id: string;
          league_member_id: string;
          player_id: string;
          slot: string;
          is_starter: boolean;
          acquired_at: string;
        };
        Insert: {
          id?: string;
          league_member_id: string;
          player_id: string;
          slot: string;
          is_starter?: boolean;
          acquired_at?: string;
        };
        Update: {
          slot?: string;
          is_starter?: boolean;
        };
      };

      /** Draft picks */
      draft_picks: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          player_id: string;
          round: number;
          pick_number: number;
          picked_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          user_id: string;
          player_id: string;
          round: number;
          pick_number: number;
          picked_at?: string;
        };
        Update: never;
      };

      /** Pro matches for scoring */
      matches: {
        Row: {
          id: string;
          team_a_id: string;
          team_b_id: string;
          tournament_name: string;
          match_date: string;
          status: MatchStatus;
          team_a_score: number | null;
          team_b_score: number | null;
          vlr_match_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_a_id: string;
          team_b_id: string;
          tournament_name: string;
          match_date: string;
          status?: MatchStatus;
          team_a_score?: number | null;
          team_b_score?: number | null;
          vlr_match_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: MatchStatus;
          team_a_score?: number | null;
          team_b_score?: number | null;
          updated_at?: string;
        };
      };

      /** Scoring configuration */
      scoring_configs: {
        Row: {
          id: string;
          name: string;
          kill_points: number;
          death_points: number;
          assist_points: number;
          acs_multiplier: number;
          first_kill_points: number;
          first_death_points: number;
          clutch_points: number;
          ace_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          kill_points?: number;
          death_points?: number;
          assist_points?: number;
          acs_multiplier?: number;
          first_kill_points?: number;
          first_death_points?: number;
          clutch_points?: number;
          ace_points?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          kill_points?: number;
          death_points?: number;
          assist_points?: number;
          acs_multiplier?: number;
          first_kill_points?: number;
          first_death_points?: number;
          clutch_points?: number;
          ace_points?: number;
        };
      };

      /** Fantasy points scored per week */
      fantasy_scores: {
        Row: {
          id: string;
          league_member_id: string;
          week_number: number;
          total_points: number;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          league_member_id: string;
          week_number: number;
          total_points: number;
          calculated_at?: string;
        };
        Update: {
          total_points?: number;
          calculated_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      player_role: PlayerRole;
      league_type: LeagueType;
      draft_format: DraftFormat;
      draft_status: DraftStatus;
      match_status: MatchStatus;
    };
  };
}

/** Helper types for easier access */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Commonly used table types */
export type Profile = Tables<"profiles">;
export type Team = Tables<"teams">;
export type Player = Tables<"players">;
export type PlayerStats = Tables<"player_stats">;
export type League = Tables<"leagues">;
export type LeagueMember = Tables<"league_members">;
export type Roster = Tables<"rosters">;
export type DraftPick = Tables<"draft_picks">;
export type Match = Tables<"matches">;
export type ScoringConfig = Tables<"scoring_configs">;
export type FantasyScore = Tables<"fantasy_scores">;