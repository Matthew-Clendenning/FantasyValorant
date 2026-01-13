import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { colors, fonts } from "../../../src/styles/theme";
import { supabase } from "../../../src/services/supabase";
import { Card } from "../../../src/components/Card";
import { PlayerRankings } from "../../../src/components/PlayerRankings";
import { CongratsModal } from "../../../src/components/CongratsModal";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { League } from "../../../src/types/database";

export default function LeagueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [league, setLeague] = useState<League | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastAnim] = useState(new Animated.Value(0));

  const isOwner = user?.id === league?.owner_id;

  useEffect(() => {
    async function fetchLeagueData() {
      if (!id) return;

      try {
        // Fetch league details
        const { data: leagueData, error: leagueError } = await supabase
          .from("leagues")
          .select("*")
          .eq("id", id)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData as League);

        // Fetch member count
        const { count, error: countError } = await supabase
          .from("league_members")
          .select("*", { count: "exact", head: true })
          .eq("league_id", id);

        if (!countError && count !== null) {
          setMemberCount(count);
        }
      } catch (error) {
        console.error("Error fetching league:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeagueData();
  }, [id]);

  const handleCopyInviteCode = async () => {
    if (!league?.invite_code) return;

    await Clipboard.setStringAsync(league.invite_code);
    setShowCopiedToast(true);

    // Animate toast
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCopiedToast(false);
    });
  };

  const handlePlayerPress = (playerId: string) => {
    console.log("Navigate to player:", playerId);
    // router.push(`/player/${playerId}`);
  };

  const handleSeeAllPlayers = () => {
    router.push("/(tabs)/players");
  };

  const handleInviteMembers = () => {
    setShowInviteModal(true);
  };

  const handleScheduleDraft = () => {
    // TODO: Navigate to draft scheduling screen
    console.log("Schedule draft");
  };

  const handleMyTeam = () => {
    router.push(`/league/${id}/my-team`);
  };

  const handleChat = () => {
    // TODO: Navigate to league chat
    console.log("Open league chat");
  };

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
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>LEAGUE</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>League not found</Text>
        </View>
      </View>
    );
  }

  const membersNeeded = Math.max(0, league.max_teams - memberCount);
  const draftStatusText = league.draft_status === "pending"
    ? "Draft not yet scheduled"
    : league.draft_status === "in_progress"
    ? "Draft in progress"
    : "Draft complete";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          FANTASY VALORANT
        </Text>
        <Pressable style={styles.chatButton} onPress={handleChat}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* My League Section Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.leagueBadge}>
            <Ionicons name="trophy" size={20} color={colors.primary} />
          </View>
          <Text style={styles.sectionHeaderTitle}>{league.name.toUpperCase()}</Text>
        </View>

        {/* Team Card - ESPN Style */}
        <Card
          style={styles.teamCard}
          gradient={false}
          backgroundImage={require("../../../assets/images/dots.png")}
          backgroundOpacity={0.2}
        >
          {/* Team Name */}
          <View style={styles.teamNameContainer}>
            <View style={styles.teamIcon}>
              <Ionicons name="shirt" size={24} color={colors.primary} />
            </View>
            <Text style={styles.teamName}>
              {user ? `${user.user_metadata?.username || "My"}'s Team` : "My Team"}
            </Text>
          </View>

          {/* Draft Status */}
          <Text style={styles.draftStatus}>{draftStatusText}</Text>

          {/* Members Needed */}
          {league.draft_status === "pending" && membersNeeded > 0 && (
            <Text style={styles.membersNeeded}>
              {membersNeeded} more league member{membersNeeded !== 1 ? "s" : ""} required to draft
            </Text>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <Pressable style={styles.actionButton} onPress={handleInviteMembers}>
              <Text style={styles.actionButtonText}>Invite Members</Text>
            </Pressable>

            {isOwner && league.draft_status === "pending" && (
              <Pressable
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleScheduleDraft}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  Schedule Draft
                </Text>
              </Pressable>
            )}
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* My Team Button */}
          <Pressable style={styles.myTeamButton} onPress={handleMyTeam}>
            <Text style={styles.myTeamButtonText}>My Team</Text>
          </Pressable>
        </Card>

        {/* Invite Code Card */}
        {/* {league.invite_code && (
          <Pressable style={styles.inviteCard} onPress={handleCopyInviteCode}>
            <View style={styles.inviteContent}>
              <View>
                <Text style={styles.inviteLabel}>INVITE CODE</Text>
                <Text style={styles.inviteCode}>{league.invite_code}</Text>
              </View>
              <View style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        )}*/ }

        {/* League Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberCount}/{league.max_teams}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{league.roster_size}</Text>
            <Text style={styles.statLabel}>Roster Size</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {league.draft_type === "snake" ? "Snake" : "Auction"}
            </Text>
            <Text style={styles.statLabel}>Draft Type</Text>
          </View>
        </View>

        {/* Player Rankings */}
        <View style={styles.rankingsSection}>
          <PlayerRankings
            limit={10}
            onPlayerPress={handlePlayerPress}
            onSeeAllPress={handleSeeAllPlayers}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Copied Toast */}
      {showCopiedToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.toastText}>Invite code copied!</Text>
        </Animated.View>
      )}

      {/* Invite Modal */}
      <CongratsModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        leagueName={league.name}
        inviteCode={league.invite_code || ""}
        title="Invite Friends"
        subtitle={"Fill your league to get started.\nInvite friends to play against."}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.backgroundDarker,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginHorizontal: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  leagueBadge: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderTitle: {
    fontFamily: fonts.valorant,
    fontSize: 16,
    color: colors.text,
  },
  teamCard: {
    marginBottom: 16,
  },
  teamNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  teamIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  draftStatus: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  membersNeeded: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#5B8DEF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPrimary: {
    backgroundColor: "#5B8DEF",
    borderColor: "#5B8DEF",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5B8DEF",
  },
  actionButtonTextPrimary: {
    color: colors.background,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.surfaceLight,
    marginBottom: 16,
  },
  myTeamButton: {
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#5B8DEF",
    alignItems: "center",
    justifyContent: "center",
  },
  myTeamButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5B8DEF",
  },
  inviteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inviteContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inviteLabel: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  inviteCode: {
    fontFamily: fonts.valorant,
    fontSize: 20,
    color: colors.text,
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceLight,
    marginHorizontal: 8,
  },
  rankingsSection: {
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
});
