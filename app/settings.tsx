import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../src/contexts/AuthContext";
import { showAlert } from "../src/utils";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SettingsModal() {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const [displayTheme, setDisplayTheme] = useState("System Setting");
  const [oddsLinksEnabled, setOddsLinksEnabled] = useState(true);

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate in when component mounts
    translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
    });
    backdropOpacity.value = withTiming(1, { duration: 300 });
    }, []);

  const handleClose = () => {
    // Animate out then navigate back
    backdropOpacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 300 },
      (finished) => {
        if (finished) {
          runOnJS(router.back)();
        }
      }
    );
  };

  const handleAuthPress = async () => {
    if (isAuthenticated) {
      try {
        await signOut();
        handleClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sign out";
        showAlert("Error", message);
      }
    } else {
      handleClose();
      router.push("/(auth)/login" as Href);
    }
  };

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView}>
          {/* Display Theme */}
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Display Theme</Text>
            <View style={styles.settingValue}>
              <Text style={styles.valueText}>{displayTheme}</Text>
              <Ionicons name="chevron-down" size={20} color="#FF4655" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Toggle Setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sportsbook Odds Links</Text>
            <Switch
              value={oddsLinksEnabled}
              onValueChange={setOddsLinksEnabled}
              trackColor={{ false: "#3A3A3C", true: "#34C759" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Navigation Items */}
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Get Help</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Legal Notices</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Prizing Rules</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Share This App</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleAuthPress}>
            <Text style={styles.settingLabel}>
              {isAuthenticated ? "Log Out" : "Log In"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
    backgroundColor: "#2d2d2dff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 60,
  },
  closeText: {
    fontSize: 17,
    color: "#FF4655",
  },
  scrollView: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#2d2d2dff"
  },
  settingLabel: {
    fontSize: 17,
    color: "#FFFFFF",
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueText: {
    fontSize: 17,
    color: "#FF4655",
  },
  divider: {
    height: 1,
    backgroundColor: "#1C1C1E",
    marginLeft: 16,
  },
});