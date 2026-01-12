import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../../services/supabase";
import type { Player, PlayerRole, Team } from "../../../types";

/**
 * Player with joined team information
 */
export type PlayerWithTeam = Player & {
  teams: Team | null;
};

/**
 * Parameters for filtering players
 */
export interface UsePlayersFilters {
  /** Filter by player role */
  role?: PlayerRole;
  /** Filter by team ID */
  team_id?: string;
  /** Filter by IGL status */
  is_igl?: boolean;
}

/**
 * Parameters for pagination
 */
export interface UsePlayersPagination {
  /** Number of records to return */
  limit?: number;
  /** Number of records to skip */
  offset?: number;
}

/**
 * Combined parameters for usePlayers hook
 */
export interface UsePlayersParams {
  filters?: UsePlayersFilters;
  pagination?: UsePlayersPagination;
}

/**
 * Response type for players query
 */
export interface PlayersResponse {
  data: PlayerWithTeam[];
  count: number;
}

/**
 * Hook to fetch players with team information
 *
 * Features:
 * - Joins teams table to include team details
 * - Supports filtering by role, team_id, and is_igl
 * - Includes pagination (limit/offset)
 * - Properly typed with database types
 * - Handles loading and error states
 *
 * @param params - Optional filters and pagination parameters
 * @returns TanStack Query result with players data
 *
 * @example
 * ```tsx
 * // Fetch all players
 * const { data, isLoading, error } = usePlayers();
 *
 * // Filter by role
 * const { data } = usePlayers({ filters: { role: 'duelist' } });
 *
 * // Filter by team and paginate
 * const { data } = usePlayers({
 *   filters: { team_id: 'team-uuid' },
 *   pagination: { limit: 20, offset: 0 }
 * });
 * ```
 */
export function usePlayers(params?: UsePlayersParams) {
  const { filters, pagination } = params || {};
  const { role, team_id, is_igl } = filters || {};
  const { limit = 50, offset = 0 } = pagination || {};

  return useQuery<PlayersResponse, Error>({
    queryKey: ["players", filters, pagination],
    queryFn: async () => {
      // Start building the query with team join
      // Supabase automatically joins based on the team_id foreign key
      let query = supabase
        .from("players")
        .select(
          `
          *,
          teams(*)
        `,
          { count: "exact" }
        );

      // Apply filters
      if (role) {
        query = query.eq("role", role);
      }

      if (team_id) {
        query = query.eq("team_id", team_id);
      }

      if (is_igl !== undefined) {
        query = query.eq("is_igl", is_igl);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match PlayerWithTeam type
      // Supabase returns teams as an object (or null) for foreign key relationships
      // Type assertion needed because TypeScript can't infer joined types
      const playersWithTeam: PlayerWithTeam[] = (data || []).map((player: any) => {
        // Handle both object and array responses (defensive programming)
        const team = player.teams
          ? Array.isArray(player.teams)
            ? player.teams[0] || null
            : player.teams
          : null;

        return {
          ...player,
          teams: team as Team | null,
        };
      });

      return {
        data: playersWithTeam,
        count: count || 0,
      };
    },
  });
}
