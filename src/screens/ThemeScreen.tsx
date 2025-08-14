import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useTheme,
  ThemeMode,
  CustomTheme,
  ThemeSchedule,
} from "../contexts/ThemeContext";
import { hapticFeedback } from "../utils";

interface ThemeScreenProps {
  navigation: any;
}

export const ThemeScreen: React.FC<ThemeScreenProps> = ({ navigation }) => {
  const {
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
  } = useTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tempSchedule, setTempSchedule] = useState<ThemeSchedule>(schedule);

  const styles = createStyles(theme);

  const handleThemeModeChange = (mode: ThemeMode) => {
    hapticFeedback.light();
    setThemeMode(mode);
  };

  const handleThemeSelect = (themeId: string) => {
    hapticFeedback.light();
    setCustomTheme(themeId);
  };

  const handleEditTheme = (themeToEdit: CustomTheme) => {
    if (["light", "dark"].includes(themeToEdit.id)) {
      Alert.alert("Aviso", "Não é possível editar temas padrão");
      return;
    }
    setEditingTheme({ ...themeToEdit });
    setShowColorPicker(true);
  };

  const handleDeleteTheme = (themeId: string) => {
    if (["light", "dark"].includes(themeId)) {
      Alert.alert("Aviso", "Não é possível deletar temas padrão");
      return;
    }

    Alert.alert(
      "Deletar Tema",
      "Tem certeza que deseja deletar este tema personalizado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => {
            hapticFeedback.light();
            deleteCustomTheme(themeId);
          },
        },
      ]
    );
  };

  const handleCreateNewTheme = () => {
    const newTheme: CustomTheme = {
      id: `custom_${Date.now()}`,
      name: "Novo Tema",
      colors: { ...theme },
    };
    setEditingTheme(newTheme);
    setShowColorPicker(true);
  };

  const handleSaveTheme = () => {
    if (!editingTheme) return;

    if (customThemes.find((t) => t.id === editingTheme.id)) {
      updateCustomTheme(editingTheme);
    } else {
      addCustomTheme(editingTheme);
    }

    setShowColorPicker(false);
    setEditingTheme(null);
    hapticFeedback.success();
  };

  const handleScheduleToggle = (enabled: boolean) => {
    const newSchedule = { ...schedule, enabled };
    setTempSchedule(newSchedule);
    updateSchedule(newSchedule);
    hapticFeedback.light();
  };

  const handleSaveSchedule = () => {
    updateSchedule(tempSchedule);
    setShowScheduleModal(false);
    hapticFeedback.success();
  };

  const renderThemeModeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Modo do Tema</Text>
      <View style={styles.modeContainer}>
        {(["light", "dark", "auto"] as ThemeMode[]).map((mode) => (
          <Pressable
            key={mode}
            style={[
              styles.modeButton,
              themeMode === mode && styles.modeButtonActive,
            ]}
            onPress={() => handleThemeModeChange(mode)}
          >
            <Ionicons
              name={
                mode === "light" ? "sunny" : mode === "dark" ? "moon" : "time"
              }
              size={20}
              color={themeMode === mode ? theme.white : theme.primary}
            />
            <Text
              style={[
                styles.modeText,
                themeMode === mode && styles.modeTextActive,
              ]}
            >
              {mode === "light"
                ? "Claro"
                : mode === "dark"
                ? "Escuro"
                : "Automático"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderThemeSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Temas Disponíveis</Text>
        <Pressable style={styles.addButton} onPress={handleCreateNewTheme}>
          <Ionicons name="add" size={20} color={theme.white} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.themesContainer}>
          {customThemes.map((customTheme) => (
            <Pressable
              key={customTheme.id}
              style={[
                styles.themeCard,
                currentThemeId === customTheme.id && styles.themeCardActive,
              ]}
              onPress={() => handleThemeSelect(customTheme.id)}
            >
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: customTheme.colors.primary },
                ]}
              >
                <View
                  style={[
                    styles.themePreviewAccent,
                    { backgroundColor: customTheme.colors.surface },
                  ]}
                />
              </View>
              <Text style={styles.themeName}>{customTheme.name}</Text>

              {!["light", "dark"].includes(customTheme.id) && (
                <View style={styles.themeActions}>
                  <Pressable
                    style={styles.themeActionButton}
                    onPress={() => handleEditTheme(customTheme)}
                  >
                    <Ionicons name="create" size={16} color={theme.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.themeActionButton}
                    onPress={() => handleDeleteTheme(customTheme.id)}
                  >
                    <Ionicons name="trash" size={16} color={theme.error} />
                  </Pressable>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderScheduleSettings = () => (
    <View style={styles.section}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Programação Automática</Text>
          <Text style={styles.settingDescription}>
            Muda automaticamente entre claro e escuro baseado no horário
          </Text>
        </View>
        <Switch
          value={schedule.enabled}
          onValueChange={handleScheduleToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.white}
        />
      </View>

      {schedule.enabled && (
        <Pressable
          style={styles.scheduleButton}
          onPress={() => setShowScheduleModal(true)}
        >
          <Text style={styles.scheduleButtonText}>
            Configurar Horários ({schedule.lightTime} - {schedule.darkTime})
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );

  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable
            style={styles.modalButton}
            onPress={() => setShowScheduleModal(false)}
          >
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Programação de Tema</Text>
          <Pressable style={styles.modalButton} onPress={handleSaveSchedule}>
            <Text style={[styles.modalButtonText, styles.modalButtonSave]}>
              Salvar
            </Text>
          </Pressable>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Tema Claro</Text>
            <TextInput
              style={styles.timeInput}
              value={tempSchedule.lightTime}
              onChangeText={(text) =>
                setTempSchedule((prev) => ({ ...prev, lightTime: text }))
              }
              placeholder="07:00"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>Tema Escuro</Text>
            <TextInput
              style={styles.timeInput}
              value={tempSchedule.darkTime}
              onChangeText={(text) =>
                setTempSchedule((prev) => ({ ...prev, darkTime: text }))
              }
              placeholder="19:00"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <Text style={styles.scheduleNote}>
            Use o formato 24h (HH:MM). O tema mudará automaticamente nos
            horários especificados.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.title}>Temas</Text>
        <Pressable style={styles.resetButton} onPress={resetToDefault}>
          <Ionicons name="refresh" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderThemeModeSelector()}
        {renderThemeSelector()}
        {renderScheduleSettings()}
      </ScrollView>

      {renderScheduleModal()}
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    resetButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    modeContainer: {
      flexDirection: "row",
      gap: 8,
    },
    modeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      gap: 8,
    },
    modeButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    modeText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    modeTextActive: {
      color: theme.white,
    },
    addButton: {
      backgroundColor: theme.primary,
      padding: 8,
      borderRadius: 8,
    },
    themesContainer: {
      flexDirection: "row",
      gap: 12,
    },
    themeCard: {
      width: 120,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    themeCardActive: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    themePreview: {
      height: 60,
      borderRadius: 8,
      marginBottom: 8,
      position: "relative",
    },
    themePreviewAccent: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 16,
      height: 16,
      borderRadius: 4,
    },
    themeName: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.text,
      textAlign: "center",
      marginBottom: 8,
    },
    themeActions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    themeActionButton: {
      padding: 4,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    settingInfo: {
      flex: 1,
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    scheduleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      marginTop: 8,
      borderRadius: 8,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    scheduleButtonText: {
      fontSize: 14,
      color: theme.text,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalButton: {
      padding: 8,
    },
    modalButtonText: {
      fontSize: 16,
      color: theme.primary,
    },
    modalButtonSave: {
      fontWeight: "600",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    timeSection: {
      marginBottom: 24,
    },
    timeLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
    },
    timeInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.card,
    },
    scheduleNote: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginTop: 16,
    },
  });
