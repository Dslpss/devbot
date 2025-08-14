import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { PromptTemplate } from "../types";

interface TemplateEditorProps {
  visible: boolean;
  template?: PromptTemplate | null;
  onSave: (
    template: Omit<
      PromptTemplate,
      "id" | "createdAt" | "isCustom" | "usageCount"
    >
  ) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { key: "code", label: "Código", icon: "code-outline" },
  { key: "explanation", label: "Explicações", icon: "book-outline" },
  { key: "analysis", label: "Análise", icon: "analytics-outline" },
  { key: "conversion", label: "Conversão", icon: "swap-horizontal-outline" },
  { key: "example", label: "Exemplos", icon: "bulb-outline" },
  { key: "custom", label: "Personalizado", icon: "settings-outline" },
] as const;

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  visible,
  template,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: template?.title || "",
    description: template?.description || "",
    template: template?.template || "",
    category: template?.category || ("custom" as const),
  });
  const [variables, setVariables] = useState<string[]>(
    template?.variables || []
  );
  const [newVariable, setNewVariable] = useState("");
  const [showVariableHelp, setShowVariableHelp] = useState(false);

  const styles = createStyles(theme);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert("Erro", "O título é obrigatório");
      return;
    }

    if (!formData.template.trim()) {
      Alert.alert("Erro", "O template é obrigatório");
      return;
    }

    onSave({
      ...formData,
      variables: variables.length > 0 ? variables : undefined,
    });
  };

  const addVariable = () => {
    const variable = newVariable.trim();
    if (variable && !variables.includes(variable)) {
      setVariables([...variables, variable]);
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  const insertVariable = (variable: string) => {
    const cursorPosition = formData.template.length;
    const newTemplate =
      formData.template.substring(0, cursorPosition) +
      `{${variable}}` +
      formData.template.substring(cursorPosition);

    setFormData((prev) => ({ ...prev, template: newTemplate }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>

          <Text style={styles.title}>
            {template ? "Editar Template" : "Novo Template"}
          </Text>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
              placeholder="Nome do template"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Descreva o que este template faz"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category.key}
                  style={[
                    styles.categoryOption,
                    formData.category === category.key &&
                      styles.categoryOptionActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, category: category.key }))
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={
                      formData.category === category.key
                        ? theme.white
                        : theme.text
                    }
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      formData.category === category.key &&
                        styles.categoryLabelActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Variáveis</Text>
              <Pressable
                style={styles.helpButton}
                onPress={() => setShowVariableHelp(!showVariableHelp)}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>

            {showVariableHelp && (
              <View style={styles.helpBox}>
                <Text style={styles.helpText}>
                  Variáveis permitem personalizar o template. Use {"{variavel}"}{" "}
                  no texto do template. Exemplos: {"{language}"}, {"{code}"},{" "}
                  {"{concept}"}
                </Text>
              </View>
            )}

            <View style={styles.variableInput}>
              <TextInput
                style={styles.input}
                value={newVariable}
                onChangeText={setNewVariable}
                placeholder="Nome da variável (ex: language)"
                placeholderTextColor={theme.textSecondary}
                onSubmitEditing={addVariable}
              />
              <Pressable style={styles.addButton} onPress={addVariable}>
                <Ionicons name="add" size={20} color={theme.white} />
              </Pressable>
            </View>

            {variables.length > 0 && (
              <View style={styles.variableList}>
                {variables.map((variable) => (
                  <View key={variable} style={styles.variableChip}>
                    <Pressable
                      style={styles.variableChipContent}
                      onPress={() => insertVariable(variable)}
                    >
                      <Text style={styles.variableChipText}>{variable}</Text>
                      <Ionicons
                        name="add-circle-outline"
                        size={16}
                        color={theme.primary}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.removeVariableButton}
                      onPress={() => removeVariable(variable)}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Template *</Text>
            <TextInput
              style={[styles.input, styles.templateInput]}
              value={formData.template}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, template: text }))
              }
              placeholder="Digite o template do prompt aqui..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>
                {formData.template ||
                  "Digite o template acima para ver o preview"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    cancelButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.white,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    helpButton: {
      padding: 4,
    },
    helpBox: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    helpText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    templateInput: {
      height: 120,
      textAlignVertical: "top",
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    categoryOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryLabel: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 6,
    },
    categoryLabelActive: {
      color: theme.white,
    },
    variableInput: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    addButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    variableList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    variableChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    variableChipContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 4,
    },
    variableChipText: {
      fontSize: 12,
      color: theme.text,
    },
    removeVariableButton: {
      padding: 6,
      marginRight: 4,
    },
    previewLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
    },
    previewBox: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 80,
    },
    previewText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
