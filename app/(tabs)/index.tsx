import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import Header from "../../src/components/Header";
import { Card } from "../../src/components/Card";
import { colors, fonts } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const displayName = profile?.display_name || profile?.username;

  return (
    <View style={styles.container}>
      <Header title="FANTASY VALORANT" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {displayName ? `Welcome, ${displayName}` : "Welcome, Guest"}
        </Text>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={require("../../assets/images/fv_logo_1.png")}
              style={styles.cardIcon}
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
      </ScrollView>
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
    fontSize: 18,
    color: colors.text,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
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
    marginTop: 16,
    backgroundColor: colors.surfaceLight,
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
});