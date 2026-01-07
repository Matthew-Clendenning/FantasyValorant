import { Alert, Platform } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
}

/**
 * Cross-platform alert that works on iOS, Android, and Web
 */
export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS === "web") {
    // Web fallback using window.alert/confirm
    const result = window.alert(`${title}\n\n${message}`);

    // Call the first button's onPress if provided
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    // Native Alert
    Alert.alert(title, message, buttons);
  }
}
