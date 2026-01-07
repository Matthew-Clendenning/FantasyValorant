import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../src/components/Input";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { colors, fonts } from "../src/styles/theme";
import { supabase } from "../src/services/supabase";
import { useAuth } from "../src/contexts/AuthContext";
import type { InsertTables } from "../src/types/database";

export default function CreateLeagueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leagueType, setLeagueType] = useState<"public" | "private">("private");
  const [maxTeams, setMaxTeams] = useState("8");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "League name is required";
    } else if (name.length < 3) {
      newErrors.name = "League name must be at least 3 characters";
    } else if (name.length > 50) {
      newErrors.name = "League name must be less than 50 characters";
    }

    const teams = parseInt(maxTeams, 10);
    if (isNaN(teams) || teams < 2 || teams > 16) {
      newErrors.maxTeams = "Max teams must be between 2 and 16";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !user) return;

    setIsLoading(true);
    try {
      const leagueData = {
        name: name.trim(),
        description: description.trim() || null,
        type: leagueType,
        max_teams: parseInt(maxTeams, 10),
        owner_id: user.id,
      } satisfies InsertTables<"leagues">;

      const { error } = await supabase
        .from("leagues")
        .insert(leagueData as never)
        .select()
        .single();

      if (error) throw error;

      Alert.alert("Success", "League created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to create league. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>CREATE LEAGUE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="League Name"
          placeholder="Enter league name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          maxLength={50}
        />

        <Input
          label="Description (Optional)"
          placeholder="Describe your league"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        <Text style={styles.label}>League Type</Text>
        <View style={styles.typeContainer}>
          <Pressable
            style={[
              styles.typeButton,
              leagueType === "private" && styles.typeButtonActive,
            ]}
            onPress={() => setLeagueType("private")}
          >
            <Ionicons
              name="lock-closed"
              size={20}
              color={leagueType === "private" ? colors.text : colors.textMuted}
            />
            <Text
              style={[
                styles.typeText,
                leagueType === "private" && styles.typeTextActive,
              ]}
            >
              Private
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typeButton,
              leagueType === "public" && styles.typeButtonActive,
            ]}
            onPress={() => setLeagueType("public")}
          >
            <Ionicons
              name="globe"
              size={20}
              color={leagueType === "public" ? colors.text : colors.textMuted}
            />
            <Text
              style={[
                styles.typeText,
                leagueType === "public" && styles.typeTextActive,
              ]}
            >
              Public
            </Text>
          </Pressable>
        </View>

        <Input
          label="Max Teams"
          placeholder="8"
          value={maxTeams}
          onChangeText={setMaxTeams}
          keyboardType="number-pad"
          error={errors.maxTeams}
          maxLength={2}
        />

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              You&apos;ll be able to invite players and set up the draft after creating the league.
            </Text>
          </View>
        </Card>

        <Button
          title="Create League"
          onPress={handleCreate}
          loading={isLoading}
          disabled={isLoading}
        />

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.backgroundDark,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.valorant,
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    backgroundColor: colors.surface,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 70, 85, 0.1)",
  },
  typeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  typeTextActive: {
    color: colors.text,
    fontWeight: "600",
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
