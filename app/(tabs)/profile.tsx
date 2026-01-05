import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../src/contexts/AuthContext";

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
    router.push("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Sign in to access your profile</Text>
        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {profile?.display_name ?? profile?.username ?? "Player"}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F1923",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ECE8E1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#768079",
    marginBottom: 24,
  },
  email: {
    fontSize: 14,
    color: "#768079",
    marginBottom: 32,
  },
  text: {
    color: "#ECE8E1",
  },
  button: {
    backgroundColor: "#FF4655",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: "#ECE8E1",
    fontWeight: "600",
    fontSize: 16,
  },
  signOutButton: {
    borderColor: "#FF4655",
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 4,
  },
  signOutText: {
    color: "#FF4655",
    fontWeight: "600",
    fontSize: 16,
  },
});
