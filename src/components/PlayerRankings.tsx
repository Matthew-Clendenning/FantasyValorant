import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../styles/theme";

// Mock data for Valorant pro players
export const MOCK_PLAYERS = [
  {
    id: "1",
    ign: "TenZ",
    realName: "Tyson Ngo",
    team: {
      name: "Sentinels",
      shortName: "SEN",
      logoColor: "#E31837",
    },
    role: "duelist",
    photoUrl: null,
    projectedPoints: 287.5,
    recentACS: 245.3,
  },
  {
    id: "2",
    ign: "aspas",
    realName: "Erick Santos",
    team: {
      name: "LOUD",
      shortName: "LOUD",
      logoColor: "#00FF00",
    },
    role: "duelist",
    photoUrl: null,
    projectedPoints: 279.2,
    recentACS: 251.8,
  },
  {
    id: "3",
    ign: "Demon1",
    realName: "Max Mazanov",
    team: {
      name: "Evil Geniuses",
      shortName: "EG",
      logoColor: "#4068a0ff",
    },
    role: "duelist",
    photoUrl: null,
    projectedPoints: 268.4,
    recentACS: 238.6,
  },
  {
    id: "4",
    ign: "yay",
    realName: "Jaccob Whiteaker",
    team: {
      name: "Cloud9",
      shortName: "C9",
      logoColor: "#00AEEF",
    },
    role: "duelist",
    photoUrl: null,
    projectedPoints: 261.8,
    recentACS: 232.1,
  },
  {
    id: "5",
    ign: "Less",
    realName: "Felipe de Loyola",
    team: {
      name: "LOUD",
      shortName: "LOUD",
      logoColor: "#00FF00",
    },
    role: "initiator",
    photoUrl: null,
    projectedPoints: 254.3,
    recentACS: 218.9,
  },
  {
    id: "6",
    ign: "johnqt",
    realName: "Mohamed Ouarid",
    team: {
      name: "Sentinels",
      shortName: "SEN",
      logoColor: "#E31837",
    },
    role: "controller",
    photoUrl: null,
    projectedPoints: 248.7,
    recentACS: 205.4,
  },
  {
    id: "7",
    ign: "Cryocells",
    realName: "Matthew Panganiban",
    team: {
      name: "100 Thieves",
      shortName: "100T",
      logoColor: "#FF0000",
    },
    role: "duelist",
    photoUrl: null,
    projectedPoints: 243.1,
    recentACS: 229.7,
  },
  {
    id: "8",
    ign: "Sacy",
    realName: "Gustavo Rossi",
    team: {
      name: "Sentinels",
      shortName: "SEN",
      logoColor: "#E31837",
    },
    role: "initiator",
    photoUrl: null,
    projectedPoints: 237.9,
    recentACS: 198.2,
  },
  {
    id: "9",
    ign: "Chronicle",
    realName: "Timofey Khromov",
    team: {
      name: "Fnatic",
      shortName: "FNC",
      logoColor: "#FF6600",
    },
    role: "sentinel",
    photoUrl: null,
    projectedPoints: 232.4,
    recentACS: 194.6,
  },
  {
    id: "10",
    ign: "Boostio",
    realName: "Kelden Pupello",
    team: {
      name: "Fnatic",
      shortName: "FNC",
      logoColor: "#FF6600",
    },
    role: "controller",
    photoUrl: null,
    projectedPoints: 228.1,
    recentACS: 188.3,
  },
];

// Role colors for badges
const ROLE_COLORS: Record<string, string> = {
  duelist: "#FF4655",
  initiator: "#5B8DEF",
  controller: "#9B59B6",
  sentinel: "#4CAF50",
  flex: "#FFC107",
};

// Role abbreviations
const ROLE_ABBREV: Record<string, string> = {
  duelist: "DUE",
  initiator: "INIT",
  controller: "CTRL",
  sentinel: "SENT",
  flex: "FLEX",
};

interface PlayerRankingsProps {
  limit?: number;
  onPlayerPress?: (playerId: string) => void;
  onSeeAllPress?: () => void;
}

export function PlayerRankings({
  limit = 5,
  onPlayerPress,
  onSeeAllPress,
}: PlayerRankingsProps) {
  const displayedPlayers = MOCK_PLAYERS.slice(0, limit);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.rankingIcon}>
            <Text style={styles.rankingIconText}>1</Text>
            <Text style={styles.rankingIconText}>2</Text>
            <Text style={styles.rankingIconText}>3</Text>
          </View>
          <Text style={styles.headerTitle}>PLAYER RANKINGS</Text>
        </View>
      </View>

      {/* Column Labels */}
      <View style={styles.columnLabels}>
        <Text style={styles.columnLabel}>PLAYERS</Text>
        <Text style={styles.columnLabelRight}>RANK</Text>
      </View>

      {/* Player List */}
      <View style={styles.playerList}>
        {displayedPlayers.map((player, index) => (
          <Pressable
            key={player.id}
            style={({ pressed }) => [
              styles.playerRow,
              pressed && styles.playerRowPressed,
            ]}
            onPress={() => onPlayerPress?.(player.id)}
          >
            {/* Player Photo/Avatar */}
            <View style={styles.playerImageContainer}>
              {player.photoUrl ? (
                <Image
                  source={{ uri: player.photoUrl }}
                  style={styles.playerImage}
                />
              ) : (
                <View
                  style={[
                    styles.playerImagePlaceholder,
                    { backgroundColor: player.team.logoColor + "30" },
                  ]}
                >
                  <Text
                    style={[
                      styles.playerInitials,
                      { color: player.team.logoColor },
                    ]}
                  >
                    {player.ign.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Player Info */}
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <Text style={styles.playerName}>{player.ign}</Text>
                <View
                  style={[
                    styles.teamBadge,
                    { backgroundColor: player.team.logoColor + "25" },
                  ]}
                >
                  <Text
                    style={[styles.teamBadgeText, { color: player.team.logoColor }]}
                  >
                    {player.team.shortName}
                  </Text>
                </View>
              </View>
              <View style={styles.playerMeta}>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: ROLE_COLORS[player.role] + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      { color: ROLE_COLORS[player.role] },
                    ]}
                  >
                    {ROLE_ABBREV[player.role]}
                  </Text>
                </View>
                <Text style={styles.projText}>PROJ: {player.projectedPoints.toFixed(1)}</Text>
              </View>
            </View>

            {/* Rank */}
            <View style={styles.rankContainer}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* See All Button */}
      {onSeeAllPress && (
        <Pressable style={styles.seeAllButton} onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>See All Players</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankingIcon: {
    width: 28,
    height: 28,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  rankingIconText: {
    fontSize: 7,
    fontWeight: "700",
    color: colors.textMuted,
    lineHeight: 8,
  },
  headerTitle: {
    fontFamily: fonts.valorant,
    fontSize: 14,
    color: colors.text,
  },
  columnLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  columnLabelRight: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  playerList: {
    paddingHorizontal: 0,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  playerRowPressed: {
    backgroundColor: colors.surfaceLight,
  },
  playerImageContainer: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  playerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  playerImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playerInitials: {
    fontSize: 16,
    fontWeight: "700",
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  teamBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  teamBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  playerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  projText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rankContainer: {
    width: 28,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMuted,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});