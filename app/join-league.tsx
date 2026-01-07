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
import { Button } from "../src/components/Button";
import { colors, fonts } from "../src/styles/theme";
import { supabase } from "../src/services/supabase";
import { useAuth } from "../src/contexts/AuthContext";

type ExperienceLevel = "pro" | "casual";
type ScoringType = "h2h_points" | "season_points" | "h2h_categories" | "rotisserie";
type LeagueFormat = "tournament" | "season" | "split";
type DraftType = "snake" | "auction";

interface RadioOption<T> {
  value: T;
  title: string;
  description: string;
}

const experienceLevels: RadioOption<ExperienceLevel>[] = [
  { value: "pro", title: "Pro", description: "I'll play against anyone anytime" },
  { value: "casual", title: "Casual", description: "I want to play with other casual players" },
];

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

const leagueFormats: RadioOption<LeagueFormat>[] = [
  {
    value: "tournament",
    title: "Tournament Based",
    description: "Follow VCT events and tournaments",
  },
  {
    value: "season",
    title: "Full Season",
    description: "Play throughout the entire VCT season",
  },
  {
    value: "split",
    title: "Single Split",
    description: "Compete during a single VCT split",
  },
];

const draftTypes: RadioOption<DraftType>[] = [
  {
    value: "snake",
    title: "Snake Draft",
    description: "Pick order reversed each round",
  },
  {
    value: "auction",
    title: "Auction Draft",
    description: "Bid on players with a salary budget",
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

export default function JoinLeagueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("pro");
  const [scoringType, setScoringType] = useState<ScoringType>("h2h_points");
  const [leagueFormat, setLeagueFormat] = useState<LeagueFormat>("tournament");
  const [draftType, setDraftType] = useState<DraftType>("snake");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinLeague = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to join a league.");
      return;
    }

    setIsLoading(true);
    try {
      // Find a matching public league based on preferences
      const { data: leagues, error: searchError } = await supabase
        .from("leagues")
        .select("*")
        .eq("type", "public")
        .eq("scoring_type", scoringType)
        .eq("draft_type", draftType)
        .limit(10);

      if (searchError) throw searchError;

      if (!leagues || leagues.length === 0) {
        Alert.alert(
          "No Leagues Found",
          "No public leagues match your preferences. Would you like to create one instead?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Create League", onPress: () => router.push("/create-league") },
          ]
        );
        return;
      }

      // For now, join the first available league
      // In production, you'd show a list or implement matchmaking
      Alert.alert("Success", "Found matching leagues! This feature is coming soon.");
    } catch (error) {
      Alert.alert("Error", "Failed to search for leagues. Please try again.");
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
        <Text style={styles.headerTitle}>JOIN LEAGUE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR EXPERIENCE LEVEL</Text>
          <Text style={styles.sectionSubtitle}>
            We&apos;ll find you a league with players of similar experience.
          </Text>
          <RadioGroup
            options={experienceLevels}
            selected={experienceLevel}
            onSelect={setExperienceLevel}
          />
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
          <Text style={styles.sectionTitle}>LEAGUE FORMAT</Text>
          <RadioGroup
            options={leagueFormats}
            selected={leagueFormat}
            onSelect={setLeagueFormat}
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

        <View style={styles.buttonContainer}>
          <Button
            title="Find League"
            onPress={handleJoinLeague}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

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
  headerTitle: {
    fontFamily: fonts.valorant,
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
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
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
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
    borderColor: "#3B82F6",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
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
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});