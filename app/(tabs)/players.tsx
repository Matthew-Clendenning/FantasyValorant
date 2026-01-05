import { StyleSheet, Text, View } from "react-native";

export default function PlayersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pro Players</Text>
      <Text style={styles.subtitle}>Browse Valorant pro players</Text>
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
