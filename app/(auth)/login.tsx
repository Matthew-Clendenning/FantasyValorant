import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

import { Button, Divider, Input, SocialButton } from "../../src/components";
import { useAuth } from "../../src/contexts/AuthContext";
import { showAlert } from "../../src/utils";
import { colors, fonts } from "../../src/styles/theme";

export default function LoginScreen() {
  const { signInWithEmail, signInWithDiscord, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    try {
      await signInWithEmail(email, password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      showAlert("Sign In Failed", message);
    }
  };

  const handleDiscordSignIn = async () => {
    try {
      await signInWithDiscord();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Discord";
      showAlert("Discord Sign In Failed", message);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password" as Href);
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup" as Href);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/fv_logo_3.png")}
            style={styles.icon}
          />
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={isLoading}
            disabled={isLoading}
          />

          <Divider />

          <SocialButton
            provider="discord"
            onPress={handleDiscordSignIn}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Pressable onPress={handleSignUp}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1923",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  icon: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  form: {
    marginBottom: 24,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    color: "#FF4655",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#768079",
    fontSize: 14,
  },
  footerLink: {
    color: "#FF4655",
    fontSize: 14,
    fontWeight: "600",
  },
});
