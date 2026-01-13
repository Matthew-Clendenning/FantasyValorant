import { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/styles/theme";
import { supabase } from "../../../src/services/supabase";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { League, LeagueMember, Player, Roster } from "../../../src/types/database";

// Valorant stats columns for horizontal scroll
const VALORANT_STATS = [
  { key: "opp", label: "OPP", width: 60 },
  { key: "score", label: "SCORE", width: 70 },
  { key: "acs", label: "ACS", width: 60 },
  { key: "k", label: "K", width: 50 },
  { key: "d", label: "D", width: 50 },
  { key: "a", label: "A", width: 50 },
  { key: "adr", label: "ADR", width: 60 },
  { key: "kast", label: "KAST", width: 65 },
  { key: "hs", label: "HS%", width: 60 },
  { key: "fk", label: "FK", width: 50 },
  { key: "fd", label: "FD", width: 50 },
];

// Valorant positions for starters
const STARTER_POSITIONS = [
  { key: "duelist", label: "DUE", fullName: "Duelist" },
  { key: "initiator", label: "INIT", fullName: "Initiator" },
  { key: "controller", label: "CTRL", fullName: "Controller" },
  { key: "sentinel", label: "SENT", fullName: "Sentinel" },
  { key: "flex", label: "FLEX", fullName: "Flex" },
];

// Bench positions
const BENCH_POSITIONS = [
  { key: "bench1", label: "BE", fullName: "Bench" },
  { key: "bench2", label: "BE", fullName: "Bench" },
  { key: "bench3", label: "BE", fullName: "Bench" },
];

// Quick action items for horizontal slider
const QUICK_ACTIONS = [
  { key: "news", label: "News", icon: "newspaper-outline" as const, status: "Caught up" },
  { key: "claims", label: "Claims", icon: "list-outline" as const, status: "0 Pending" },
  { key: "trades", label: "Trades", icon: "swap-horizontal-outline" as const, status: "0 Offers" },
  { key: "chat", label: "League Chat", icon: "chatbubbles-outline" as const, status: "Caught up" },
  { key: "deadline", label: "Trade Deadline", icon: "calendar-outline" as const, status: "TBD" },
];

// Header tabs
const HEADER_TABS = ["ROSTER", "MATCHUP", "PLAYERS", "LEAGUE"] as const;
type HeaderTab = (typeof HEADER_TABS)[number];

interface RosterPlayer {
  position: string;
  player: Player | null;
  stats: {
    opp: string;
    score: number;
    acs: number;
    k: number;
    d: number;
    a: number;
    adr: number;
    kast: number;
    hs: number;
    fk: number;
    fd: number;
  } | null;
}

export default function MyTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Refs for synchronized horizontal scrolling
  const startersHeaderRef = useRef<ScrollView>(null);
  const startersRowRefs = useRef<(ScrollView | null)[]>([]);
  const benchHeaderRef = useRef<ScrollView>(null);
  const benchRowRefs = useRef<(ScrollView | null)[]>([]);
  const isScrolling = useRef(false);

  const [league, setLeague] = useState<League | null>(null);
  const [leagueMember, setLeagueMember] = useState<LeagueMember | null>(null);
  const [starters, setStarters] = useState<RosterPlayer[]>([]);
  const [bench, setBench] = useState<RosterPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HeaderTab>("ROSTER");
  const [teamRecord, setTeamRecord] = useState({ wins: 0, losses: 0 });
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!id || !user) return;

      try {
        // Fetch league details
        const { data: leagueData, error: leagueError } = await supabase
          .from("leagues")
          .select("*")
          .eq("id", id)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData as League);

        // Fetch league member data for current user (use maybeSingle to handle no results)
        const { data: memberData, error: memberError } = await supabase
          .from("league_members")
          .select("*")
          .eq("league_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (memberError) {
          if (__DEV__) {
            console.error("Error fetching member:", memberError.code);
          }
        } else if (memberData) {
          const typedMemberData = memberData as LeagueMember;
          setLeagueMember(typedMemberData);

          // Fetch roster with player details
          const { data: rosterData, error: rosterError } = await supabase
            .from("rosters")
            .select(`
              *,
              player:players(*)
            `)
            .eq("league_member_id", typedMemberData.id);

          if (!rosterError && rosterData) {
            // Type assertion required for Supabase join queries - TypeScript can't infer joined types
            type RosterWithPlayer = Roster & { player: Player | null };
            const typedRosterData = rosterData as RosterWithPlayer[];

            // Separate starters and bench
            const starterRoster: RosterPlayer[] = STARTER_POSITIONS.map((pos) => {
              const rosterEntry = typedRosterData.find(
                (r) => r.slot === pos.key && r.is_starter
              );
              return {
                position: pos.key,
                player: rosterEntry?.player || null,
                stats: null, // Will be populated with actual stats later
              };
            });

            const benchRoster: RosterPlayer[] = BENCH_POSITIONS.map((pos, index) => {
              const benchPlayers = typedRosterData.filter((r) => !r.is_starter);
              const rosterEntry = benchPlayers[index];
              return {
                position: pos.key,
                player: rosterEntry?.player || null,
                stats: null,
              };
            });

            setStarters(starterRoster);
            setBench(benchRoster);
          }
        } else {
          // User is not a member of this league yet, initialize empty rosters
          const emptyStarters: RosterPlayer[] = STARTER_POSITIONS.map((pos) => ({
            position: pos.key,
            player: null,
            stats: null,
          }));
          const emptyBench: RosterPlayer[] = BENCH_POSITIONS.map((pos) => ({
            position: pos.key,
            player: null,
            stats: null,
          }));
          setStarters(emptyStarters);
          setBench(emptyBench);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error fetching data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, user]);

  const handleBack = () => {
    router.back();
  };

  const handleChat = () => {
    // TODO: Implement chat functionality
  };

  const handleTabPress = (tab: HeaderTab) => {
    setActiveTab(tab);
    // TODO: Navigate to respective screens when implemented
  };

  const handleQuickAction = (_actionKey: string) => {
    // TODO: Navigate to respective screens based on actionKey
  };

  const handleEditStarters = () => {
    // TODO: Open edit starters modal/screen
  };

  const handleEditBench = () => {
    // TODO: Open edit bench modal/screen
  };

  const handlePlayerPress = (_player: Player | null, _position: string) => {
    // TODO: Navigate to player details or open player selection
  };

  // Sync all starters ScrollViews
  const syncStartersScroll = useCallback((offsetX: number, sourceIndex: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    // Sync header
    if (sourceIndex !== -1) {
      startersHeaderRef.current?.scrollTo({ x: offsetX, animated: false });
    }

    // Sync all rows except source
    startersRowRefs.current.forEach((ref, index) => {
      if (index !== sourceIndex && ref) {
        ref.scrollTo({ x: offsetX, animated: false });
      }
    });

    setTimeout(() => {
      isScrolling.current = false;
    }, 16);
  }, []);

  // Sync all bench ScrollViews
  const syncBenchScroll = useCallback((offsetX: number, sourceIndex: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    // Sync header
    if (sourceIndex !== -1) {
      benchHeaderRef.current?.scrollTo({ x: offsetX, animated: false });
    }

    // Sync all rows except source
    benchRowRefs.current.forEach((ref, index) => {
      if (index !== sourceIndex && ref) {
        ref.scrollTo({ x: offsetX, animated: false });
      }
    });

    setTimeout(() => {
      isScrolling.current = false;
    }, 16);
  }, []);

  const handleStartersHeaderScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncStartersScroll(e.nativeEvent.contentOffset.x, -1);
  }, [syncStartersScroll]);

  const handleBenchHeaderScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncBenchScroll(e.nativeEvent.contentOffset.x, -1);
  }, [syncBenchScroll]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!league) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Team Not Found</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
    );
  }

  const fullTeamName = leagueMember?.team_name ||
    (user ? `${user.user_metadata?.username || "My"}'s Team` : "My Team");
  const teamName = fullTeamName.length > 16 ? `${fullTeamName.slice(0, 16)}...` : fullTeamName;
  const ownerName = user?.user_metadata?.username || "Owner";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <View>
            <Image
              source={require("../../../assets/images/fv_logo_3.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {teamName}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </View>
        <Pressable style={styles.chatButton} onPress={handleChat}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {HEADER_TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Info Section */}
        <View style={styles.teamInfoSection}>
          <View style={styles.teamInfoLeft}>
            <View style={styles.teamIconLarge}>
              <Ionicons name="shirt" size={32} color={colors.primary} />
            </View>
            <View style={styles.teamInfoText}>
              <View style={styles.teamNameRow}>
                <Text style={styles.teamNameLarge}>{teamName}</Text>
                <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.ownerText}>
                {ownerName} {"\u2022"} {teamRecord.wins}-{teamRecord.losses}
              </Text>
            </View>
          </View>
          <Text style={styles.totalPointsText}>{totalPoints}</Text>
        </View>

        {/* Quick Actions Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsScroll}
          contentContainerStyle={styles.quickActionsContent}
        >
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(action.key)}
            >
              <View style={styles.quickActionHeader}>
                <Ionicons name={action.icon} size={16} color={colors.text} />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </View>
              <Text style={styles.quickActionStatus}>{action.status}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* EDIT STARTERS Section */}
        <View style={styles.rosterSection}>
          <View style={styles.rosterHeader}>
            <Pressable style={styles.editButton} onPress={handleEditStarters}>
              <Text style={styles.rosterSectionTitle}>EDIT STARTERS</Text>
            </Pressable>
            <ScrollView
              ref={startersHeaderRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsHeaderScroll}
              contentContainerStyle={styles.statsHeaderContent}
              onScroll={handleStartersHeaderScroll}
              scrollEventThrottle={16}
            >
              {VALORANT_STATS.map((stat) => (
                <View key={stat.key} style={[styles.statHeaderCell, { width: stat.width }]}>
                  <Text style={styles.statHeaderText}>{stat.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Starters List */}
          {STARTER_POSITIONS.map((pos, index) => {
            const rosterPlayer = starters[index];
            return (
              <View key={pos.key} style={[styles.playerRow, { backgroundColor: index % 2 === 0 ? colors.background : colors.backgroundDark }]}>
                <Pressable
                  style={styles.playerInfoSection}
                  onPress={() => handlePlayerPress(rosterPlayer?.player || null, pos.key)}
                >
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{pos.label}</Text>
                  </View>
                  {rosterPlayer?.player ? (
                    <View style={styles.playerDetails}>
                      <Text style={styles.playerName}>{rosterPlayer.player.ign}</Text>
                      <Text style={styles.playerTeam}>
                        {rosterPlayer.player.role.toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.emptySlotText}>Empty</Text>
                  )}
                </Pressable>
                <ScrollView
                  ref={(ref) => { startersRowRefs.current[index] = ref; }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.statsRowScroll}
                  contentContainerStyle={styles.statsRowContent}
                  onScroll={(e) => syncStartersScroll(e.nativeEvent.contentOffset.x, index)}
                  scrollEventThrottle={16}
                >
                  {VALORANT_STATS.map((stat) => (
                    <View key={stat.key} style={[styles.statCell, { width: stat.width }]}>
                      <Text style={styles.statValue}>
                        {rosterPlayer?.stats?.[stat.key as keyof typeof rosterPlayer.stats] ?? "-"}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })}

          {/* Starters Total */}
          <View style={styles.totalsRow}>
            <View style={styles.totalsLabel}>
              <Text style={styles.totalsText}>TOTALS</Text>
            </View>
            <Text style={styles.totalsValue}>{totalPoints}</Text>
          </View>
        </View>

        {/* EDIT BENCH Section */}
        <View style={styles.rosterSection}>
          <View style={styles.rosterHeader}>
            <Pressable style={styles.editButton} onPress={handleEditBench}>
              <Text style={styles.rosterSectionTitle}>EDIT BENCH</Text>
            </Pressable>
            <ScrollView
              ref={benchHeaderRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsHeaderScroll}
              contentContainerStyle={styles.statsHeaderContent}
              onScroll={handleBenchHeaderScroll}
              scrollEventThrottle={16}
            >
              {VALORANT_STATS.map((stat) => (
                <View key={stat.key} style={[styles.statHeaderCell, { width: stat.width }]}>
                  <Text style={styles.statHeaderText}>{stat.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Bench List */}
          {BENCH_POSITIONS.map((pos, index) => {
            const rosterPlayer = bench[index];
            return (
              <View key={`${pos.key}-${index}`} style={[styles.playerRow, { backgroundColor: index % 2 === 0 ? colors.background : colors.backgroundDark }]}>
                <Pressable
                  style={styles.playerInfoSection}
                  onPress={() => handlePlayerPress(rosterPlayer?.player || null, pos.key)}
                >
                  <View style={[styles.positionBadge, styles.benchBadge]}>
                    <Text style={[styles.positionText, styles.benchPositionText]}>{pos.label}</Text>
                  </View>
                  {rosterPlayer?.player ? (
                    <View style={styles.playerDetails}>
                      <Text style={styles.playerName}>{rosterPlayer.player.ign}</Text>
                      <Text style={styles.playerTeam}>
                        {rosterPlayer.player.role.toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.emptySlotText}>Empty</Text>
                  )}
                </Pressable>
                <ScrollView
                  ref={(ref) => { benchRowRefs.current[index] = ref; }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.statsRowScroll}
                  contentContainerStyle={styles.statsRowContent}
                  onScroll={(e) => syncBenchScroll(e.nativeEvent.contentOffset.x, index)}
                  scrollEventThrottle={16}
                >
                  {VALORANT_STATS.map((stat) => (
                    <View key={stat.key} style={[styles.statCell, { width: stat.width }]}>
                      <Text style={styles.statValue}>
                        {rosterPlayer?.stats?.[stat.key as keyof typeof rosterPlayer.stats] ?? "-"}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.backgroundDarker,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    maxWidth: 180,
  },
  chatButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 40,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.backgroundDarker,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#F5C451",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  teamInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundDark,
  },
  teamInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  teamIconLarge: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  teamInfoText: {
    flex: 1,
  },
  teamNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  teamNameLarge: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  ownerText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  totalPointsText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  quickActionsScroll: {
    backgroundColor: colors.backgroundDark,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
    paddingVertical: 18,
    paddingTop: 0,
    gap: 4,
  },
  quickActionItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    minWidth: 100,
  },
  quickActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  quickActionStatus: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rosterSection: {
    
  },
  rosterHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  editButton: {
    width: 140,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rosterSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },
  statsHeaderScroll: {
    flex: 1,
  },
  statsHeaderContent: {
    flexDirection: "row",
  },
  statHeaderCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  statHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    minHeight: 72,
  },
  playerInfoSection: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  positionBadge: {
    width: 48,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#5B8DEF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  benchBadge: {
    borderColor: colors.textMuted,
  },
  positionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5B8DEF",
    letterSpacing: 0.3,
  },
  benchPositionText: {
    color: colors.textMuted,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  playerTeam: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptySlotText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  statsRowScroll: {
    flex: 1,
  },
  statsRowContent: {
    flexDirection: "row",
  },
  statCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 13,
    color: colors.text,
  },
  totalsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: colors.backgroundDark,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomColor: colors.surface,
  },
  totalsLabel: {
    marginRight: 16,
  },
  totalsText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  totalsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  bottomPadding: {
    height: 40,
  },
});
