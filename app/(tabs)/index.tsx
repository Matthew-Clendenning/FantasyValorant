import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import Header from "../../src/components/Header";
import { Card } from "../../src/components/Card";
import { CongratsModal } from "../../src/components/CongratsModal";
import { colors, fonts } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../src/services/supabase";
import type { League } from "../../src/types/database";
import {
  hasUserLoggedInBefore,
  markUserAsLoggedIn,
} from "../../src/utils/welcomeStorage";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    showCongrats?: string;
    leagueName?: string;
    inviteCode?: string;
  }>();
  const { user, profile, isLoading } = useAuth();
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [createdLeagueName, setCreatedLeagueName] = useState("");
  const [createdInviteCode, setCreatedInviteCode] = useState("");
  const [userLeagues, setUserLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);

  // Fetch user's leagues (owned + joined)
  const fetchUserLeagues = useCallback(async () => {
    if (!user?.id) {
      setUserLeagues([]);
      setLeaguesLoading(false);
      return;
    }

    try {
      // Get leagues owned by user
      const { data: ownedData, error: ownedError } = await supabase
        .from("leagues")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) throw ownedError;
      const ownedLeagues = (ownedData as League[]) || [];

      // Get leagues user has joined (as a member)
      const { data: membershipData, error: memberError } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      // Get full league data for joined leagues (excluding owned ones)
      const memberships = membershipData as { league_id: string }[] | null;
      const joinedLeagueIds = memberships
        ?.map((m) => m.league_id)
        .filter((id) => !ownedLeagues.some((l) => l.id === id)) || [];

      let joinedLeagues: League[] = [];
      if (joinedLeagueIds.length > 0) {
        const { data, error } = await supabase
          .from("leagues")
          .select("*")
          .in("id", joinedLeagueIds);

        if (error) throw error;
        joinedLeagues = (data as League[]) || [];
      }

      setUserLeagues([...ownedLeagues, ...joinedLeagues]);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    } finally {
      setLeaguesLoading(false);
    }
  }, [user?.id]);

  // Refresh leagues when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserLeagues();
    }, [fetchUserLeagues])
  );

  // Handle showing congrats modal from navigation params
  useEffect(() => {
    if (params.showCongrats === "true") {
      setCreatedLeagueName(params.leagueName || "your league");
      setCreatedInviteCode(params.inviteCode || "");
      setShowCongratsModal(true);

      // Clear the params so modal doesn't show again on re-render
      router.setParams({
        showCongrats: undefined,
        leagueName: undefined,
        inviteCode: undefined,
      });
    }
  }, [params.showCongrats, params.leagueName, params.inviteCode, router]);

  useEffect(() => {
    async function checkReturningUser() {
      if (!user?.id) return;

      const hasLoggedInBefore = await hasUserLoggedInBefore(user.id);
      setIsReturningUser(hasLoggedInBefore);

      // Mark as logged in for next time (after a short delay so they see the message)
      if (!hasLoggedInBefore) {
        setTimeout(() => {
          markUserAsLoggedIn(user.id);
        }, 2000);
      }
    }

    checkReturningUser();
  }, [user?.id]);

  if (isLoading || isReturningUser === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const displayName = profile?.display_name || profile?.username;
  const welcomeText = isReturningUser ? "Welcome back" : "Welcome";

  return (
    <View style={styles.container}>
      <Header title="FANTASY VALORANT" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {displayName ? `${welcomeText}, ${displayName}` : "Welcome, Guest"}
        </Text>
        <View style={styles.cardGlowWrapper}>
          <View style={styles.cardGlow} />
          <Card
            style={styles.card}
            backgroundImage={require("../../assets/images/dots.png")}
            backgroundOpacity={0.35}
          >
          <View style={styles.cardHeader}>
            <Image
              source={require("../../assets/images/fv_logo_3.png")}
              style={styles.logo}
            />
            <Text style={styles.cardText}>BUILD YOUR DREAM TEAM</Text>
          </View>
          <Card
            style={styles.subCard}
            pressable
            gradient={false}
            onPress={() => router.push("/create-league")}
          >
            <View style={styles.subcardDescContainer}>
              <View style={styles.subCardTextContainer}>
                <Text style={styles.subCardTitle}>CREATE NEW LEAGUE</Text>
                <Text style={styles.subCardDescription}>
                  Begin a league and invite your friends
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4655" />
            </View>
          </Card>
          <Card
            style={styles.subCard}
            pressable
            gradient={false}
            onPress={() => router.push("/join-league")}
          >
            <View style={styles.subcardDescContainer}>
              <View style={styles.subCardTextContainer}>
                <Text style={styles.subCardTitle}>JOIN PUBLIC LEAGUE</Text>
                <Text style={styles.subCardDescription}>
                  Jump into an active league and test your picks
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4655" />
            </View>
          </Card>
        </Card>
        </View>

        {/* Your Leagues Section */}
        {user && (
          <View style={styles.leaguesSection}>
            <View style={styles.leaguesSectionHeader}>
              <Text style={styles.leaguesSectionTitle}>YOUR LEAGUES</Text>
              {userLeagues.length > 0 && (
                <Pressable onPress={() => router.push("/(tabs)/leagues")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              )}
            </View>

            {leaguesLoading ? (
              <View style={styles.leaguesLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : userLeagues.length === 0 ? (
              <Card style={styles.emptyLeaguesCard} gradient={false}>
                <View style={styles.emptyLeaguesContent}>
                  <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.emptyLeaguesText}>
                    No leagues yet. Create or join one to get started!
                  </Text>
                </View>
              </Card>
            ) : (
              <View style={styles.leaguesList}>
                {userLeagues.slice(0, 3).map((league) => (
                  <Pressable
                    key={league.id}
                    style={styles.leagueCard}
                    onPress={() => router.push(`/league/${league.id}` as never)}
                  >
                    <View style={styles.leagueCardContent}>
                      <View style={styles.leagueInfo}>
                        <Text style={styles.leagueName} numberOfLines={1}>
                          {league.name}
                        </Text>
                        <Text style={styles.leagueMeta}>
                          {league.type === "private" ? "Private" : "Public"} • {league.max_teams} teams
                        </Text>
                      </View>
                      <View style={styles.leagueStatus}>
                        <View style={[
                          styles.statusBadge,
                          league.draft_status === "completed"
                            ? styles.statusActive
                            : styles.statusPending
                        ]}>
                          <Text style={styles.statusText}>
                            {league.draft_status === "completed" ? "Active" : "Draft Pending"}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Congrats Modal */}
      <CongratsModal
        visible={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        leagueName={createdLeagueName}
        inviteCode={createdInviteCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  subtitle: {
    fontFamily: fonts.valorant,
    fontSize: 14,
    color: colors.text,
    paddingBottom: 10,
  },
  cardGlowWrapper: {
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.3,
    // iOS shadow for enhanced glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    // Android elevation (limited effect)
    elevation: 20,
  },
  card: {
    paddingBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 12,
    paddingBlock: 18,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  cardText: {
    flex: 1,
    fontFamily: fonts.valorant,
    fontSize: 28,
    color: colors.text,
  },
  subcardDescContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subCardTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  subCard: {
    backgroundColor: colors.surfaceLight,
    marginBottom: 10,
  },
  subCardTitle: {
    fontFamily: fonts.valorant,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  subCardDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  text: {
    fontFamily: fonts.valorant,
    color: colors.text,
  },
  // Leagues section styles
  leaguesSection: {
    marginTop: 24,
  },
  leaguesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leaguesSectionTitle: {
    fontFamily: fonts.valorant,
    fontSize: 14,
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  leaguesLoading: {
    padding: 32,
    alignItems: "center",
  },
  emptyLeaguesCard: {
    backgroundColor: colors.surface,
  },
  emptyLeaguesContent: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  emptyLeaguesText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  leaguesList: {
    gap: 10,
  },
  leagueCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  leagueCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leagueInfo: {
    flex: 1,
    marginRight: 12,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  leagueMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  leagueStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  statusPending: {
    backgroundColor: "rgba(255, 193, 7, 0.15)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
});