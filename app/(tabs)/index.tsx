import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import Header from "../../src/components/Header";
import { Card } from "../../src/components/Card";
import { colors, fonts } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  hasUserLoggedInBefore,
  markUserAsLoggedIn,
} from "../../src/utils/welcomeStorage";

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);

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
});