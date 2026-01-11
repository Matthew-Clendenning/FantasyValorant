import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../src/styles/theme";
import { supabase } from "../../src/services/supabase";
import { Card } from "../../src/components/Card";
import type { League } from "../../src/types/database";

export default function LeagueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeague() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("leagues")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setLeague(data as League);
      } catch (error) {
        console.error("Error fetching league:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeague();
  }, [id]);

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

  const getDraftStatusColor = () => {
    switch (league.draft_status) {
      case "completed":
        return "#4CAF50";
      case "in_progress":
        return "#FF9800";
      default:
        return "#FFC107";
    }
  };

  const getDraftStatusText = () => {
    switch (league.draft_status) {
      case "completed":
        return "Draft Complete";
      case "in_progress":
        return "Draft In Progress";
      default:
        return "Draft Pending";
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {league.name.toUpperCase()}
        </Text>
        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* League Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.leagueTypeContainer}>
              <Ionicons
                name={league.type === "private" ? "lock-closed" : "globe"}
                size={16}
                color={colors.text}
              />
              <Text style={styles.leagueType}>
                {league.type === "private" ? "Private League" : "Public League"}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getDraftStatusColor() + "25" }]}>
              <View style={[styles.statusDot, { backgroundColor: getDraftStatusColor() }]} />
              <Text style={[styles.statusText, { color: getDraftStatusColor() }]}>
                {getDraftStatusText()}
              </Text>
            </View>
          </View>

          {league.description && (
            <Text style={styles.description}>{league.description}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{league.max_teams}</Text>
              <Text style={styles.statLabel}>Max Teams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{league.roster_size}</Text>
              <Text style={styles.statLabel}>Roster Size</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
          </View>
        </Card>

        {/* Invite Code Card */}
        {league.invite_code && (
          <Card style={styles.inviteCard} gradient={false}>
            <View style={styles.inviteContent}>
              <View>
                <Text style={styles.inviteLabel}>INVITE CODE</Text>
                <Text style={styles.inviteCode}>{league.invite_code}</Text>
              </View>
              <Pressable style={styles.copyButton}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "rgba(255, 70, 85, 0.15)" }]}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>View Roster</Text>
          </Pressable>

          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "rgba(91, 141, 239, 0.15)" }]}>
              <Ionicons name="swap-horizontal" size={24} color="#5B8DEF" />
            </View>
            <Text style={styles.actionText}>Make Trade</Text>
          </Pressable>

          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "rgba(76, 175, 80, 0.15)" }]}>
              <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Standings</Text>
          </Pressable>

          <Pressable style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "rgba(255, 193, 7, 0.15)" }]}>
              <Ionicons name="calendar" size={24} color="#FFC107" />
            </View>
            <Text style={styles.actionText}>Schedule</Text>
          </Pressable>
        </View>

        {/* Draft Section */}
        {league.draft_status === "pending" && (
          <>
            <Text style={styles.sectionTitle}>DRAFT</Text>
            <Card style={styles.draftCard} gradient={false}>
              <View style={styles.draftContent}>
                <Ionicons name="flash" size={32} color={colors.primary} />
                <View style={styles.draftInfo}>
                  <Text style={styles.draftTitle}>Draft Not Started</Text>
                  <Text style={styles.draftDescription}>
                    Waiting for all members to join before starting the draft.
                  </Text>
                </View>
              </View>
              <Pressable style={styles.draftButton}>
                <Text style={styles.draftButtonText}>Start Draft</Text>
              </Pressable>
            </Card>
          </>
        )}

        {/* Members Section - Placeholder */}
        <Text style={styles.sectionTitle}>MEMBERS</Text>
        <Card style={styles.membersCard} gradient={false}>
          <View style={styles.memberPlaceholder}>
            <Ionicons name="person-circle-outline" size={40} color={colors.textMuted} />
            <Text style={styles.memberPlaceholderText}>
              Member list coming soon...
            </Text>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    backgroundColor: colors.backgroundDark,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.valorant,
    fontSize: 18,
    color: colors.primary,
    textAlign: "center",
    marginHorizontal: 8,
  },
  settingsButton: {
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
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leagueTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leagueType: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: fonts.valorant,
    fontSize: 24,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surfaceLight,
  },
  inviteCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
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
  sectionTitle: {
    fontFamily: fonts.valorant,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  draftCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  draftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  draftDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  draftButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.background,
  },
  membersCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  memberPlaceholder: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  memberPlaceholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bottomPadding: {
    height: 40,
  },
});
