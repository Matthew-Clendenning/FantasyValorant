import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  style?: ViewStyle;
  pressable?: boolean;
  gradient?: boolean;
}

export function Card({
  children,
  variant = "default",
  style,
  pressable = false,
  gradient = true,
  ...props
}: CardProps) {
  const isOutlined = variant === "outlined";
  const showGradient = gradient && !isOutlined;

  const content = showGradient ? (
    <LinearGradient
      colors={["#1A0A0B", "#FF4655"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, isOutlined ? styles.outlined : styles.solid, style]}>
      {children}
    </View>
  );

  if (pressable) {
    return (
      <Pressable
        style={({ pressed }) => pressed && styles.pressed}
        {...props}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
  },
  solid: {
    backgroundColor: "#1A1A1A",
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  pressed: {
    opacity: 0.8,
  },
});
