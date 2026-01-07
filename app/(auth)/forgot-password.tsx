import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";

import { Button, Input } from "../../src/components";
import { useAuth } from "../../src/contexts/AuthContext";
import { showAlert } from "../../src/utils";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      showAlert(
        "Check Your Email",
        "We've sent password reset instructions to your email address.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login" as Href) }]
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      showAlert("Reset Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ECE8E1" />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to reset
            your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={error}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={handleBack}>
            <Text style={styles.footerLink}>Back to Sign In</Text>
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
    padding: 24,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 24,
    alignSelf: "flex-start",
    padding: 8,
    marginLeft: -8,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ECE8E1",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#768079",
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerLink: {
    color: "#FF4655",
    fontSize: 14,
    fontWeight: "600",
  },
});
