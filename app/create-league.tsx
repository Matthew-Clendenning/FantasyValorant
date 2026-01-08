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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../src/components/Input";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { colors, fonts } from "../src/styles/theme";
import { supabase } from "../src/services/supabase";
import { useAuth } from "../src/contexts/AuthContext";
import type { InsertTables, ScoringType, DraftType } from "../src/types/database";

interface RadioOption<T> {
  value: T;
  title: string;
  description: string;
}

const scoringTypes: RadioOption<ScoringType>[] = [
  {
    value: "h2h_points",
    title: "Head to Head Points",
    description: "Score more points than your opponent each week",
  },
  {
    value: "rotisserie",
    title: "Rotisserie",
    description: "Earn points by ranking highest in each stat category",
  },
  {
    value: "h2h_categories",
    title: "Head to Head Categories",
    description: "Win or lose based on stats like ACS, K/D, and assists",
  },
  {
    value: "season_points",
    title: "Season Points",
    description: "Earn as many points as possible over the entire season",
  },
];

const draftTypes: RadioOption<DraftType>[] = [
  {
    value: "snake",
    title: "Snake Draft",
    description: "Pick order reverses each round - great for beginners",
  },
  {
    value: "auction",
    title: "Auction Draft",
    description: "Bid on players with a salary budget - more strategic",
  },
];

interface RadioGroupProps<T> {
  options: RadioOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

function RadioGroup<T extends string>({
  options,
  selected,
  onSelect,
}: RadioGroupProps<T>) {
  return (
    <View style={styles.radioGroup}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
            onPress={() => onSelect(option.value)}
          >
            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioContent}>
              <Text style={[styles.radioTitle, isSelected && styles.radioTitleSelected]}>
                {option.title}
              </Text>
              <Text style={styles.radioDescription}>{option.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CreateLeagueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leagueType, setLeagueType] = useState<"public" | "private">("private");
  const [scoringType, setScoringType] = useState<ScoringType>("h2h_points");
  const [draftType, setDraftType] = useState<DraftType>("snake");
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
        scoring_type: scoringType,
        draft_type: draftType,
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
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCORING TYPE</Text>
          <RadioGroup
            options={scoringTypes}
            selected={scoringType}
            onSelect={setScoringType}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DRAFT TYPE</Text>
          <RadioGroup
            options={draftTypes}
            selected={draftType}
            onSelect={setDraftType}
          />
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.surfaceLight,
    padding: 14,
    gap: 14,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255, 70, 85, 0.08)",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  radioTitleSelected: {
    color: colors.text,
  },
  radioDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
