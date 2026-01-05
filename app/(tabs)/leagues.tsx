import { StyleSheet, Text, View } from "react-native";

export default function LeaguesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Leagues</Text>
      <Text style={styles.subtitle}>Your fantasy leagues will appear here</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4655",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#768079",
  },
});
