import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { PromptTemplate } from "../types";
import { TemplateCard } from "../components/TemplateCard";
import { TemplateEditor } from "../components/TemplateEditor";
import { usePromptTemplates } from "../hooks/usePromptTemplates";

interface TemplatesScreenProps {
  navigation: any;
}

interface VariableInputModalProps {
  visible: boolean;
  template: PromptTemplate | null;
  onApply: (prompt: string) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { key: "all", label: "Todas", icon: "grid-outline" },
  { key: "code", label: "Código", icon: "code-outline" },
  { key: "explanation", label: "Explicações", icon: "book-outline" },
  { key: "analysis", label: "Análise", icon: "analytics-outline" },
  { key: "conversion", label: "Conversão", icon: "swap-horizontal-outline" },
  { key: "example", label: "Exemplos", icon: "bulb-outline" },
  { key: "custom", label: "Personalizados", icon: "settings-outline" },
] as const;

const VariableInputModal: React.FC<VariableInputModalProps> = ({
  visible,
  template,
  onApply,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [variables, setVariables] = useState<Record<string, string>>({});

  const styles = createModalStyles(theme);

  const handleApply = () => {
    if (!template) return;

    let appliedTemplate = template.template;

    // Substituir variáveis
    if (template.variables) {
      template.variables.forEach((variable) => {
        const value = variables[variable] || `{${variable}}`;
        appliedTemplate = appliedTemplate.replace(
          new RegExp(`{${variable}}`, "g"),
          value
        );
      });
    }

    onApply(appliedTemplate);
  };

  const updateVariable = (variable: string, value: string) => {
    setVariables((prev) => ({ ...prev, [variable]: value }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personalizar Template</Text>
            <Pressable style={styles.closeButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.templateTitle}>{template?.title}</Text>

            {template?.variables && (
              <>
                <Text style={styles.sectionTitle}>Preencha as variáveis:</Text>
                {template.variables.map((variable) => (
                  <View key={variable} style={styles.variableInput}>
                    <Text style={styles.variableLabel}>{variable}</Text>
                    <TextInput
                      style={styles.input}
                      value={variables[variable] || ""}
                      onChangeText={(value) => updateVariable(variable, value)}
                      placeholder={`Digite o valor para ${variable}`}
                      placeholderTextColor={theme.textSecondary}
                      multiline={variable === "code"}
                      numberOfLines={variable === "code" ? 4 : 1}
                    />
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Preview:</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>
                {template
                  ? (() => {
                      let preview = template.template;
                      if (template.variables) {
                        template.variables.forEach((variable) => {
                          const value = variables[variable] || `{${variable}}`;
                          preview = preview.replace(
                            new RegExp(`{${variable}}`, "g"),
                            value
                          );
                        });
                      }
                      return preview;
                    })()
                  : ""}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Usar Template</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();

  // Estados
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PromptTemplate["category"] | "all"
  >("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(
    null
  );
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);

  // Hook de templates
  const {
    templates,
    loading,
    createTemplate,
    editTemplate,
    deleteTemplate,
    duplicateTemplate,
    filterByCategory,
    searchTemplates,
    getMostUsedTemplates,
  } = usePromptTemplates();

  const styles = createStyles(theme);

  // Filtrar templates
  const filteredTemplates = React.useMemo(() => {
    let filtered = filterByCategory(selectedCategory);
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
      if (selectedCategory !== "all") {
        filtered = filtered.filter((t) => t.category === selectedCategory);
      }
    }
    return filtered;
  }, [
    templates,
    selectedCategory,
    searchQuery,
    filterByCategory,
    searchTemplates,
  ]);

  const mostUsedTemplates = getMostUsedTemplates(3);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (
    templateData: Omit<
      PromptTemplate,
      "id" | "createdAt" | "isCustom" | "usageCount"
    >
  ) => {
    try {
      if (editingTemplate) {
        await editTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o template");
    }
  };

  const handleDeleteTemplate = (template: PromptTemplate) => {
    Alert.alert(
      "Excluir Template",
      `Tem certeza que deseja excluir "${template.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteTemplate(template.id),
        },
      ]
    );
  };

  const handleDuplicateTemplate = async (template: PromptTemplate) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível duplicar o template");
    }
  };

  const handleUseTemplate = (template: PromptTemplate) => {
    if (template.variables && template.variables.length > 0) {
      setSelectedTemplate(template);
      setShowVariableModal(true);
    } else {
      // Usar template diretamente
      navigation.navigate("Chat", {
        initialPrompt: template.template,
        templateId: template.id,
      });
    }
  };

  const handleApplyTemplate = (prompt: string) => {
    setShowVariableModal(false);
    navigation.navigate("Chat", {
      initialPrompt: prompt,
      templateId: selectedTemplate?.id,
    });
  };

  const renderTemplateItem = useCallback(
    ({ item }: { item: PromptTemplate }) => (
      <TemplateCard
        template={item}
        onPress={() => handleUseTemplate(item)}
        onEdit={item.isCustom ? () => handleEditTemplate(item) : undefined}
        onDelete={item.isCustom ? () => handleDeleteTemplate(item) : undefined}
        onDuplicate={() => handleDuplicateTemplate(item)}
      />
    ),
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Carregando templates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Text style={styles.title}>Templates</Text>

        <Pressable style={styles.addButton} onPress={handleCreateTemplate}>
          <Ionicons name="add" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar templates..."
            placeholderTextColor={theme.textSecondary}
          />
          {searchQuery && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filtros por Categoria */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.key ? theme.white : theme.text
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.key &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Contador de Resultados */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredTemplates.length} template
          {filteredTemplates.length !== 1 ? "s" : ""}
        </Text>
        {selectedCategory !== "all" && (
          <Text style={styles.filterInfo}>
            Filtrado por:{" "}
            {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
          </Text>
        )}
      </View>

      {/* Lista Principal de Templates */}
      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={80}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "Nenhum template encontrado"
                : "Nenhum template ainda"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Tente ajustar os filtros de busca"
                : "Crie seu primeiro template personalizado"}
            </Text>
          </View>
        }
      />

      {/* Seção Mais Utilizados */}
      {!searchQuery && mostUsedTemplates.length > 0 && (
        <View style={styles.mostUsedSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Mais Utilizados</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mostUsedTemplates.map((template) => (
              <View key={template.id} style={styles.horizontalCard}>
                <TemplateCard
                  template={template}
                  onPress={() => handleUseTemplate(template)}
                  showActions={false}
                  compact={true}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <TemplateEditor
        visible={showEditor}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />

      <VariableInputModal
        visible={showVariableModal}
        template={selectedTemplate}
        onApply={handleApplyTemplate}
        onCancel={() => setShowVariableModal(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
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
      flex: 1,
      textAlign: "center",
    },
    addButton: {
      padding: 8,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      marginLeft: 8,
      marginRight: 8,
    },
    categoriesSection: {
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    categoriesContainer: {
      paddingBottom: 16,
      paddingTop: 8,
    },
    categoriesContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginRight: 10,
      borderRadius: 25,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 42,
    },
    categoryChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
      marginLeft: 8,
      lineHeight: 18,
    },
    categoryChipTextActive: {
      color: theme.white,
      fontWeight: "600",
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    mostUsedSection: {
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      marginVertical: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginLeft: 8,
    },
    horizontalCard: {
      width: 220,
      marginRight: 12,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    resultsCount: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    filterInfo: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "500",
    },
    listContent: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });

const createModalStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modal: {
      backgroundColor: theme.card,
      borderRadius: 16,
      width: "100%",
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      padding: 20,
      maxHeight: 400,
    },
    templateTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 12,
      marginTop: 16,
    },
    variableInput: {
      marginBottom: 16,
    },
    variableLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.surface,
      textAlignVertical: "top",
    },
    previewContainer: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    previewText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    cancelButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    applyButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.primary,
      alignItems: "center",
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.white,
    },
  });
