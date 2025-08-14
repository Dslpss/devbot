import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { storageService } from "../services/storageService";

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  borderLight: string;
  warning: string;
  error: string;
  success: string;
  white: string;
  black: string;
  gradientStart: string;
  gradientEnd: string;
  subtleBg: string;
  overlay: string;
  shadow: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export interface ThemeSchedule {
  enabled: boolean;
  lightTime: string; // HH:MM format
  darkTime: string; // HH:MM format
}

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  customThemes: CustomTheme[];
  currentThemeId: string;
  schedule: ThemeSchedule;

  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (themeId: string) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  updateCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (themeId: string) => void;
  updateSchedule: (schedule: ThemeSchedule) => void;
  resetToDefault: () => void;
}

const lightColors: ThemeColors = {
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

const darkColors: ThemeColors = {
  primary: "#0A84FF",
  primaryDark: "#005EC1",
  primaryLight: "#1E3A8A",
  background: "#000000",
  surface: "#1C1C1E",
  card: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textInverse: "#000000",
  border: "#38383A",
  borderLight: "#48484A",
  warning: "#FFB100",
  error: "#FF453A",
  success: "#32D74B",
  white: "#FFFFFF",
  black: "#000000",
  gradientStart: "#0A84FF",
  gradientEnd: "#5E5CE6",
  subtleBg: "#1C1C1E",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "rgba(0, 0, 0, 0.3)",
};

const defaultCustomThemes: CustomTheme[] = [
  {
    id: "light",
    name: "Padrão Claro",
    colors: lightColors,
  },
  {
    id: "dark",
    name: "Padrão Escuro",
    colors: darkColors,
  },
  {
    id: "blue",
    name: "Azul Oceano",
    colors: {
      ...lightColors,
      primary: "#1E40AF",
      primaryDark: "#1E3A8A",
      primaryLight: "#DBEAFE",
      gradientStart: "#1E40AF",
      gradientEnd: "#3B82F6",
      subtleBg: "#EFF6FF",
    },
  },
  {
    id: "green",
    name: "Verde Natureza",
    colors: {
      ...lightColors,
      primary: "#059669",
      primaryDark: "#047857",
      primaryLight: "#D1FAE5",
      gradientStart: "#059669",
      gradientEnd: "#10B981",
      subtleBg: "#ECFDF5",
    },
  },
  {
    id: "purple",
    name: "Roxo Místico",
    colors: {
      ...lightColors,
      primary: "#7C3AED",
      primaryDark: "#6D28D9",
      primaryLight: "#EDE9FE",
      gradientStart: "#7C3AED",
      gradientEnd: "#A855F7",
      subtleBg: "#F5F3FF",
    },
  },
];

const defaultSchedule: ThemeSchedule = {
  enabled: false,
  lightTime: "07:00",
  darkTime: "19:00",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [customThemes, setCustomThemes] =
    useState<CustomTheme[]>(defaultCustomThemes);
  const [currentThemeId, setCurrentThemeId] = useState<string>("light");
  const [schedule, setSchedule] = useState<ThemeSchedule>(defaultSchedule);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Determina se está no modo escuro
  const isDark = React.useMemo(() => {
    if (themeMode === "light") return false;
    if (themeMode === "dark") return true;

    // Modo automático
    if (schedule.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const lightTime = schedule.lightTime;
      const darkTime = schedule.darkTime;

      if (lightTime < darkTime) {
        return currentTime >= darkTime || currentTime < lightTime;
      } else {
        return currentTime >= darkTime && currentTime < lightTime;
      }
    }

    return systemColorScheme === "dark";
  }, [themeMode, systemColorScheme, schedule]);

  // Determina o tema atual
  const theme = React.useMemo(() => {
    let baseTheme = customThemes.find((t) => t.id === currentThemeId);

    if (!baseTheme) {
      baseTheme = customThemes.find((t) => t.id === "light") || customThemes[0];
    }

    // Se estiver no modo escuro e o tema atual não for escuro, usar versão escura
    if (isDark && !currentThemeId.includes("dark")) {
      const darkTheme = customThemes.find((t) => t.id === "dark");
      if (darkTheme) {
        return {
          ...baseTheme.colors,
          background: darkTheme.colors.background,
          surface: darkTheme.colors.surface,
          card: darkTheme.colors.card,
          text: darkTheme.colors.text,
          textSecondary: darkTheme.colors.textSecondary,
          border: darkTheme.colors.border,
          borderLight: darkTheme.colors.borderLight,
          subtleBg: darkTheme.colors.subtleBg,
          overlay: darkTheme.colors.overlay,
          shadow: darkTheme.colors.shadow,
        };
      }
    }

    return baseTheme.colors;
  }, [customThemes, currentThemeId, isDark]);

  // Carrega configurações salvas
  useEffect(() => {
    loadThemeSettings();
  }, []);

  // Escuta mudanças no tema do sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Agenda verificação automática do tema
  useEffect(() => {
    if (schedule.enabled && themeMode === "auto") {
      const interval = setInterval(() => {
        // Força re-render para verificar horário
        setSystemColorScheme((prev) => prev);
      }, 60000); // Verifica a cada minuto

      return () => clearInterval(interval);
    }
  }, [schedule.enabled, themeMode]);

  const loadThemeSettings = async () => {
    try {
      const savedSettings = await storageService.getThemeSettings();
      if (savedSettings) {
        setThemeModeState(savedSettings.themeMode || "auto");
        setCurrentThemeId(savedSettings.currentThemeId || "light");
        setCustomThemes(savedSettings.customThemes || defaultCustomThemes);
        setSchedule(savedSettings.schedule || defaultSchedule);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de tema:", error);
    }
  };

  const saveThemeSettings = async (settings: any) => {
    try {
      await storageService.saveThemeSettings(settings);
    } catch (error) {
      console.error("Erro ao salvar configurações de tema:", error);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeSettings({
      themeMode: mode,
      currentThemeId,
      customThemes,
      schedule,
    });
  };

  const setCustomTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    saveThemeSettings({
      themeMode,
      currentThemeId: themeId,
      customThemes,
      schedule,
    });
  };

  const addCustomTheme = (newTheme: CustomTheme) => {
    const updatedThemes = [...customThemes, newTheme];
    setCustomThemes(updatedThemes);
    saveThemeSettings({
      themeMode,
      currentThemeId,
      customThemes: updatedThemes,
      schedule,
    });
  };

  const updateCustomTheme = (updatedTheme: CustomTheme) => {
    const updatedThemes = customThemes.map((theme) =>
      theme.id === updatedTheme.id ? updatedTheme : theme
    );
    setCustomThemes(updatedThemes);
    saveThemeSettings({
      themeMode,
      currentThemeId,
      customThemes: updatedThemes,
      schedule,
    });
  };

  const deleteCustomTheme = (themeId: string) => {
    if (["light", "dark"].includes(themeId)) {
      return; // Não permite deletar temas padrão
    }

    const updatedThemes = customThemes.filter((theme) => theme.id !== themeId);
    setCustomThemes(updatedThemes);

    // Se o tema atual foi deletado, volta para o padrão
    let newCurrentThemeId = currentThemeId;
    if (currentThemeId === themeId) {
      newCurrentThemeId = "light";
      setCurrentThemeId(newCurrentThemeId);
    }

    saveThemeSettings({
      themeMode,
      currentThemeId: newCurrentThemeId,
      customThemes: updatedThemes,
      schedule,
    });
  };

  const updateSchedule = (newSchedule: ThemeSchedule) => {
    setSchedule(newSchedule);
    saveThemeSettings({
      themeMode,
      currentThemeId,
      customThemes,
      schedule: newSchedule,
    });
  };

  const resetToDefault = () => {
    setThemeModeState("auto");
    setCurrentThemeId("light");
    setCustomThemes(defaultCustomThemes);
    setSchedule(defaultSchedule);
    saveThemeSettings({
      themeMode: "auto",
      currentThemeId: "light",
      customThemes: defaultCustomThemes,
      schedule: defaultSchedule,
    });
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    customThemes,
    currentThemeId,
    schedule,
    setThemeMode,
    setCustomTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    updateSchedule,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
};
