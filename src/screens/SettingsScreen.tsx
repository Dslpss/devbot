import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils";
import { storageService } from "../services/storageService";

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

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
              Alert.alert("Sucesso", "Dados limpos com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar os dados");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Key do Gemini</Text>
          <Text style={styles.sectionDescription}>
            Configure sua API Key do Google Gemini para usar o DevBot
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isEditing && styles.inputEditing]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Cole sua API Key aqui"
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
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveConfig}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como obter sua API Key</Text>
          <View style={styles.steps}>
            <Text style={styles.step}>
              1. Acesse: https://aistudio.google.com/app/apikey
            </Text>
            <Text style={styles.step}>2. Faça login com sua conta Google</Text>
            <Text style={styles.step}>3. Clique em "Create API Key"</Text>
            <Text style={styles.step}>4. Copie a chave gerada e cole aqui</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearData}>
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={styles.dangerButtonText}>Limpar todos os dados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.aboutText}>
            DevBot v1.0.0{"\n"}
            Seu assistente de programação com IA
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  inputEditing: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editButton: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  steps: {
    marginTop: 8,
  },
  step: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "10",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
