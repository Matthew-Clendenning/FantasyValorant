import { StyleSheet } from "react-native";

export const colors = {
  primary: "#FF4655",
  background: "#0F1923",
  backgroundDark: "#0c151c",
  backgroundDarker: "#080f14",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  text: "#ECE8E1",
  textMuted: "#8B8B8B",
  error: "#FF4655",
  success: "#4CAF50",
};

export const fonts = {
  valorant: "Valorant",
};

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: fonts.valorant,
    color: colors.text,
  },
  heading: {
    fontFamily: fonts.valorant,
    color: colors.primary,
    fontSize: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
