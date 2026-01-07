import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/contexts/AuthContext";
import { colors, fonts } from "../../src/styles/theme";

export default function ProfileScreen() {
  const { user, profile, isAuthenticated, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/(auth)/login" as Href);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Sign in to access your profile</Text>
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {profile?.display_name ?? profile?.username ?? "Player"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontFamily: fonts.valorant,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 32,
  },
  text: {
    fontFamily: fonts.valorant,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  signOutButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
});
