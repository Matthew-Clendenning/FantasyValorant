import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import Header from "../../src/components/Header";

export default function HomeScreen() {
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
      <Text style={styles.subtitle}>
        {displayName ? `Welcome, \n${displayName}` : "Welcome, Guest"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1923",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    flex: 1,
    alignContent: "center",
    textAlign: "center",
    fontSize: 16,
    color: "#ECE8E1",
  },
  text: {
    color: "#ECE8E1",
  },
});
