import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  Linking,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils";
import { storageService } from "../services/storageService";
import { useTheme } from "../contexts/ThemeContext";

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const { theme, isDark, setThemeMode, themeMode } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [dataUsage, setDataUsage] = useState({
    messages: 0,
    templates: 0,
    quizzes: 0,
  });

  useEffect(() => {
    loadConfig();
    loadDataUsage();
  }, []);

  const loadDataUsage = async () => {
    try {
      // Simular estatísticas de uso - você pode implementar isso no storageService
      const conversations = await storageService.getConversations();
      const messagesCount = conversations.reduce(
        (acc, conv) => acc + conv.messages.length,
        0
      );

      setDataUsage({
        messages: messagesCount,
        templates: 0, // Implementar quando tiver templates salvos
        quizzes: 0, // Implementar quando tiver histórico de quizzes
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const loadConfig = async () => {
    try {
      const config = await storageService.getConfig();
      setApiKey(config.apiKey || "");
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const saveConfig = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Erro", "Por favor, insira uma API Key válida");
      return;
    }

    setLoading(true);
    try {
      const currentConfig = await storageService.getConfig();
      await storageService.saveConfig({
        ...currentConfig,
        apiKey: apiKey.trim(),
      });
      setIsEditing(false);
      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as configurações");
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    Alert.alert(
      "Limpar Dados",
      "Isso irá apagar todas as conversas e configurações. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.clearAllData();
              setApiKey("");
              loadDataUsage(); // Recarregar estatísticas
              Alert.alert("Sucesso", "Dados limpos com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar os dados");
            }
          },
        },
      ]
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: `Conheça o DevBot! 🤖\n\nSeu assistente de programação com IA que te ajuda a aprender e resolver problemas de código.\n\nBaixe agora e acelere seu aprendizado!`,
        title: "DevBot - Assistente de Programação com IA",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      Alert.alert("Erro", "Não foi possível abrir o link")
    );
  };

  const exportData = () => {
    Alert.alert(
      "Exportar Dados",
      "Esta funcionalidade permite fazer backup das suas conversas e configurações.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Exportar",
          onPress: () => {
            // Implementar exportação no futuro
            Alert.alert("Em breve", "Funcionalidade em desenvolvimento");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Seção de Tema */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Aparência
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="color-palette"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Modo Escuro
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {themeMode === "auto"
                    ? "Automático"
                    : isDark
                    ? "Ativado"
                    : "Desativado"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("Theme")}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="brush"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Temas Personalizados
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Customize cores e aparência
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Seção de Estatísticas */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Estatísticas de Uso
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles" size={24} color={theme.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {dataUsage.messages}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Mensagens
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color={theme.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {dataUsage.templates}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Templates
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="school" size={24} color={theme.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {dataUsage.quizzes}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Quizzes
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ProgressScreen")}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="analytics"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Dashboard de Progresso
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Veja seu progresso detalhado
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Seção API */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            API Key do Gemini
          </Text>
          <Text
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Configure sua API Key do Google Gemini para usar o DevBot
          </Text>

          <View
            style={[
              styles.inputContainer,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                isEditing && styles.inputEditing,
                { color: theme.text },
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Cole sua API Key aqui"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!isEditing}
              editable={isEditing}
              multiline={isEditing}
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons
                name={isEditing ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={saveConfig}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Como obter sua API Key
          </Text>
          <View style={styles.steps}>
            <Text style={[styles.step, { color: theme.text }]}>
              1. Acesse: https://aistudio.google.com/app/apikey
            </Text>
            <Text style={[styles.step, { color: theme.text }]}>
              2. Faça login com sua conta Google
            </Text>
            <Text style={[styles.step, { color: theme.text }]}>
              3. Clique em "Create API Key"
            </Text>
            <Text style={[styles.step, { color: theme.text }]}>
              4. Copie a chave gerada e cole aqui
            </Text>
          </View>
        </View>

        {/* Seção de Preferências */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Preferências
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="notifications"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Notificações
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Receber lembretes de estudo
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="save"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Salvamento Automático
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Salvar conversas automaticamente
                </Text>
              </View>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>
        </View>

        {/* Seção de Dados */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Gerenciar Dados
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={exportData}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="download"
                size={20}
                color={theme.success}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Exportar Dados
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Fazer backup das suas conversas
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: theme.error + "10",
                borderColor: theme.error + "30",
              },
            ]}
            onPress={clearData}
          >
            <Ionicons name="trash" size={20} color={theme.error} />
            <Text style={[styles.dangerButtonText, { color: theme.error }]}>
              Limpar todos os dados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Compartilhar */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Compartilhar
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={shareApp}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="share-social"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Compartilhar App
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Indique o DevBot para amigos
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openLink("https://github.com/Dslpss/devbot")}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="logo-github"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Código Fonte
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Veja o projeto no GitHub
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Seção de Sobre */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Sobre
          </Text>
          <View style={styles.aboutContainer}>
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <Ionicons name="code-slash" size={32} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.appName, { color: theme.text }]}>
                  DevBot
                </Text>
                <Text
                  style={[styles.appVersion, { color: theme.textSecondary }]}
                >
                  Versão 1.0.0
                </Text>
              </View>
            </View>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
              Seu assistente de programação com IA para acelerar o aprendizado e
              resolver problemas de código.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openLink("mailto:dennisemannuel93@gmail.com")}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="mail"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Suporte
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Entre em contato conosco
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openLink("https://devbot.example.com/privacy")}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={theme.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Política de Privacidade
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Como protegemos seus dados
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,122,255,0.05)",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  inputEditing: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editButton: {
    padding: 12,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  steps: {
    marginTop: 8,
  },
  step: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  aboutContainer: {
    marginBottom: 16,
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0,122,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 14,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
