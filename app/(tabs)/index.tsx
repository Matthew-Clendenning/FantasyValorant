import { StyleSheet, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
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
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {displayName ? `Welcome, ${displayName}` : "Welcome, Guest"}
        </Text>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={require("../../assets/images/react-logo.png")}
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
              <View>
                <Text style={styles.subCardTitle}>CREATE NEW LEAGUE</Text>
                <Text style={styles.subCardDescription}>
                  Start your own league and invite friends
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4655" />
            </View>
          </Card>
          <Text style={styles.cardQuestion}>Already have a team? <Text style={styles.spanText}>Log In</Text></Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  subtitle: {
    fontFamily: fonts.valorant,
    fontSize: 18,
    color: colors.text,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    height: 300,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingRight: 60,
  },
  cardIcon: {
    width: 50,
    height: 50,
  },
  cardText: {
    fontFamily: fonts.valorant,
    fontSize: 30,
    color: colors.text,
  },
  subcardDescContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  cardQuestion: {
    textAlign: "center",
    marginTop: 20,
  },
  spanText: {
    color: "#fff",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  text: {
    fontFamily: fonts.valorant,
    color: colors.text,
  },
});
