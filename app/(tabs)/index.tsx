import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../src/contexts/AuthContext";

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fantasy Valorant</Text>
      <Text style={styles.subtitle}>
        {user ? `Welcome, ${user.email}` : "Welcome, Guest"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F1923",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4655",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ECE8E1",
  },
  text: {
    color: "#ECE8E1",
  },
});
