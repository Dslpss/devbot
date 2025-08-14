export const colors = {
  primary: "#007AFF",
  primaryDark: "#0051B3",
  primaryLight: "#E5F1FF",
  background: "#F8F8F8",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#000000",
  textSecondary: "#666666",
  textInverse: "#FFFFFF",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  warning: "#FFB100",
  error: "#FF3B30",
  success: "#34C759",
  white: "#FFFFFF",
  black: "#000000",
  gradientStart: "#0A84FF",
  gradientEnd: "#4F46E5",
  subtleBg: "#F0F4FA",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.1)",
};

// Export theme-related types and hook
export { useTheme, ThemeProvider } from "../contexts/ThemeContext";
export type {
  ThemeColors,
  ThemeMode,
  CustomTheme,
  ThemeSchedule,
} from "../contexts/ThemeContext";
