import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

interface SocialButtonProps extends Omit<PressableProps, "style"> {
  provider: "discord";
  loading?: boolean;
}

const providerConfig = {
  discord: {
    label: "Continue with Discord",
    color: "#5865F2",
    icon: "logo-discord" as const,
  },
};

export function SocialButton({
  provider,
  loading = false,
  disabled,
  ...props
}: SocialButtonProps) {
  const config = providerConfig[provider];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: config.color },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          <Ionicons name={config.icon} size={22} color="#FFFFFF" />
          <Text style={styles.text}>{config.label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
