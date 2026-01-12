import {
  Pressable,
  StyleSheet,
  View,
  ImageBackground,
  type PressableProps,
  type ViewStyle,
  type ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";


interface CardProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  style?: ViewStyle;
  pressable?: boolean;
  gradient?: boolean;
  backgroundImage?: ImageSourcePropType;
  backgroundOpacity?: number;
}

export function Card({
  children,
  variant = "default",
  style,
  pressable = false,
  gradient = true,
  backgroundImage,
  backgroundOpacity,
  ...props
}: CardProps) {
  const isOutlined = variant === "outlined";
  const showGradient = gradient && !isOutlined;

  const content = showGradient ? (
    <LinearGradient
      colors={["#1A0A0B", "#cb3743ff"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, style]}
    >
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: backgroundOpacity }}
        />
      )}
      <View style={styles.contentContainer}>{children}</View>
    </LinearGradient>
  ) : (
    <View style={[styles.card, isOutlined ? styles.outlined : styles.solid, style]}>
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          resizeMode="repeat"
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: backgroundOpacity }}
        />
      )}
      <View style={styles.contentContainer}>{children}</View>
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
    overflow: "hidden",
  },
  contentContainer: {
    zIndex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignSelf: "center",
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
