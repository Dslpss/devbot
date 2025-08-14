import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Share,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../contexts/ThemeContext";
import { CodeSnippet, SnippetCategory, SnippetCollection } from "../types";
import { storageService } from "../services/storageService";
import { generateId, hapticFeedback } from "../utils";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface SnippetsScreenProps {
  navigation: any;
}

const DEFAULT_CATEGORIES: SnippetCategory[] = [
  { id: "react", name: "React", icon: "logo-react", color: "#61DAFB" },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "logo-javascript",
    color: "#F7DF1E",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "code-slash",
    color: "#3178C6",
  },
  { id: "python", name: "Python", icon: "logo-python", color: "#3776AB" },
  { id: "node", name: "Node.js", icon: "logo-nodejs", color: "#339933" },
  { id: "css", name: "CSS", icon: "color-palette", color: "#1572B6" },
  { id: "html", name: "HTML", icon: "code", color: "#E34F26" },
  { id: "sql", name: "SQL", icon: "server", color: "#4479A1" },
  { id: "other", name: "Outros", icon: "document-text", color: "#666666" },
];

export const SnippetsScreen: React.FC<SnippetsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
  const [collections, setCollections] = useState<SnippetCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(
    null
  );
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    code: "",
    language: "javascript",
    category: "javascript",
    description: "",
    tags: "",
  });

  const styles = createStyles(theme);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSnippets();
  }, [snippets, searchQuery, selectedCategory, showFavoritesOnly]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedSnippets, loadedCollections] = await Promise.all([
        storageService.getSnippets(),
        storageService.getCollections(),
      ]);
      setSnippets(loadedSnippets);
      setCollections(loadedCollections);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os snippets");
    } finally {
      setLoading(false);
    }
  };

  const filterSnippets = () => {
    let filtered = [...snippets];

    if (searchQuery) {
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          snippet.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (snippet) => snippet.category === selectedCategory
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((snippet) => snippet.isFavorite);
    }

    setFilteredSnippets(filtered);
  };

  const handleCreateSnippet = async () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim()) {
      Alert.alert("Erro", "Título e código são obrigatórios");
      return;
    }

    try {
      const snippet: CodeSnippet = {
        id: editingSnippet?.id || generateId(),
        title: newSnippet.title.trim(),
        code: newSnippet.code.trim(),
        language: newSnippet.language,
        category: newSnippet.category,
        description: newSnippet.description.trim(),
        tags: newSnippet.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdAt: editingSnippet?.createdAt || new Date(),
        updatedAt: new Date(),
        isFavorite: editingSnippet?.isFavorite || false,
        source: editingSnippet?.source || "manual",
      };

      await storageService.saveSnippet(snippet);
      await loadData();

      setShowCreateModal(false);
      setEditingSnippet(null);
      setNewSnippet({
        title: "",
        code: "",
        language: "javascript",
        category: "javascript",
        description: "",
        tags: "",
      });

      hapticFeedback.success();
      Alert.alert(
        "Sucesso",
        editingSnippet ? "Snippet atualizado!" : "Snippet criado!"
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o snippet");
    }
  };

  const handleEditSnippet = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setNewSnippet({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      category: snippet.category,
      description: snippet.description || "",
      tags: snippet.tags.join(", "),
    });
    setShowCreateModal(true);
  };

  const handleDeleteSnippet = (snippet: CodeSnippet) => {
    Alert.alert(
      "Deletar Snippet",
      `Tem certeza que deseja deletar "${snippet.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await storageService.deleteSnippet(snippet.id);
              await loadData();
              hapticFeedback.success();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deletar o snippet");
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (snippet: CodeSnippet) => {
    try {
      const updatedSnippet = {
        ...snippet,
        isFavorite: !snippet.isFavorite,
        updatedAt: new Date(),
      };
      await storageService.saveSnippet(updatedSnippet);
      await loadData();
      hapticFeedback.light();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o snippet");
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      hapticFeedback.success();
      Alert.alert("Copiado!", "Código copiado para a área de transferência");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar o código");
    }
  };

  const handleShareSnippet = async (snippet: CodeSnippet) => {
    try {
      const content = `${snippet.title}\n\n${snippet.code}\n\n${
        snippet.description || ""
      }`;
      await Share.share({
        message: content,
        title: snippet.title,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar o snippet");
    }
  };

  const handleExportSnippets = async () => {
    try {
      const data = await storageService.exportSnippets();
      const filename = `devbot-snippets-${
        new Date().toISOString().split("T")[0]
      }.json`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, data);

      await Share.share({
        url: fileUri,
        title: "Exportar Snippets",
      });

      hapticFeedback.success();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar os snippets");
    }
  };

  const handleImportSnippets = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const content = await FileSystem.readAsStringAsync(
          result.assets[0].uri
        );
        const imported = await storageService.importSnippets(content);

        await loadData();
        hapticFeedback.success();
        Alert.alert(
          "Importação Concluída",
          `${imported.snippets} snippets e ${imported.collections} coleções importados!`
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível importar os snippets. Verifique o formato do arquivo."
      );
    }
  };

  const renderSnippetCard = ({ item: snippet }: { item: CodeSnippet }) => {
    const category = DEFAULT_CATEGORIES.find(
      (cat) => cat.id === snippet.category
    );

    return (
      <Pressable
        style={styles.snippetCard}
        onPress={() => handleEditSnippet(snippet)}
      >
        <View style={styles.snippetHeader}>
          <View style={styles.snippetInfo}>
            <View style={styles.snippetTitleRow}>
              <Ionicons
                name={(category?.icon as any) || "document-text"}
                size={16}
                color={category?.color || theme.primary}
              />
              <Text style={styles.snippetTitle} numberOfLines={1}>
                {snippet.title}
              </Text>
            </View>
            <Text style={styles.snippetLanguage}>{snippet.language}</Text>
          </View>

          <View style={styles.snippetActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleToggleFavorite(snippet)}
            >
              <Ionicons
                name={snippet.isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={snippet.isFavorite ? theme.error : theme.textSecondary}
              />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleCopyCode(snippet.code)}
            >
              <Ionicons name="copy" size={18} color={theme.primary} />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleShareSnippet(snippet)}
            >
              <Ionicons name="share" size={18} color={theme.primary} />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleDeleteSnippet(snippet)}
            >
              <Ionicons name="trash" size={18} color={theme.error} />
            </Pressable>
          </View>
        </View>

        {snippet.description && (
          <Text style={styles.snippetDescription} numberOfLines={2}>
            {snippet.description}
          </Text>
        )}

        <View style={styles.codePreview}>
          <Text style={styles.codeText} numberOfLines={3}>
            {snippet.code}
          </Text>
        </View>

        {snippet.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {snippet.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {snippet.tags.length > 3 && (
              <Text style={styles.moreTags}>+{snippet.tags.length - 3}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
    >
      <Pressable
        style={[
          styles.categoryChip,
          selectedCategory === "all" && styles.categoryChipActive,
        ]}
        onPress={() => setSelectedCategory("all")}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === "all" && styles.categoryTextActive,
          ]}
        >
          Todos
        </Text>
      </Pressable>

      {DEFAULT_CATEGORIES.map((category) => (
        <Pressable
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Ionicons
            name={category.icon as any}
            size={16}
            color={
              selectedCategory === category.id ? theme.white : category.color
            }
          />
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}
          >
            {category.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable
            style={styles.modalButton}
            onPress={() => {
              setShowCreateModal(false);
              setEditingSnippet(null);
              setNewSnippet({
                title: "",
                code: "",
                language: "javascript",
                category: "javascript",
                description: "",
                tags: "",
              });
            }}
          >
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </Pressable>

          <Text style={styles.modalTitle}>
            {editingSnippet ? "Editar Snippet" : "Novo Snippet"}
          </Text>

          <Pressable style={styles.modalButton} onPress={handleCreateSnippet}>
            <Text style={[styles.modalButtonText, styles.modalButtonSave]}>
              {editingSnippet ? "Salvar" : "Criar"}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.textInput}
              value={newSnippet.title}
              onChangeText={(text) =>
                setNewSnippet((prev) => ({ ...prev, title: text }))
              }
              placeholder="Nome do snippet"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Linguagem</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.languageSelector}>
                {[
                  "javascript",
                  "typescript",
                  "python",
                  "react",
                  "css",
                  "html",
                  "sql",
                  "other",
                ].map((lang) => (
                  <Pressable
                    key={lang}
                    style={[
                      styles.languageChip,
                      newSnippet.language === lang && styles.languageChipActive,
                    ]}
                    onPress={() =>
                      setNewSnippet((prev) => ({ ...prev, language: lang }))
                    }
                  >
                    <Text
                      style={[
                        styles.languageText,
                        newSnippet.language === lang &&
                          styles.languageTextActive,
                      ]}
                    >
                      {lang}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.languageSelector}>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.languageChip,
                      newSnippet.category === cat.id &&
                        styles.languageChipActive,
                    ]}
                    onPress={() =>
                      setNewSnippet((prev) => ({ ...prev, category: cat.id }))
                    }
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={
                        newSnippet.category === cat.id ? theme.white : cat.color
                      }
                    />
                    <Text
                      style={[
                        styles.languageText,
                        newSnippet.category === cat.id &&
                          styles.languageTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Código *</Text>
            <TextInput
              style={[styles.textInput, styles.codeInput]}
              value={newSnippet.code}
              onChangeText={(text) =>
                setNewSnippet((prev) => ({ ...prev, code: text }))
              }
              placeholder="Cole seu código aqui..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              value={newSnippet.description}
              onChangeText={(text) =>
                setNewSnippet((prev) => ({ ...prev, description: text }))
              }
              placeholder="Descrição do snippet..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags (separadas por vírgula)</Text>
            <TextInput
              style={styles.textInput}
              value={newSnippet.tags}
              onChangeText={(text) =>
                setNewSnippet((prev) => ({ ...prev, tags: text }))
              }
              placeholder="react, hooks, useState"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Carregando snippets...</Text>
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

        <Text style={styles.title}>Snippets</Text>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerAction} onPress={handleImportSnippets}>
            <Ionicons name="download" size={20} color={theme.text} />
          </Pressable>

          <Pressable style={styles.headerAction} onPress={handleExportSnippets}>
            <Ionicons name="share" size={20} color={theme.text} />
          </Pressable>

          <Pressable
            style={styles.headerAction}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar snippets..."
            placeholderTextColor={theme.textSecondary}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.filterButton,
            showFavoritesOnly && styles.filterButtonActive,
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? "heart" : "heart-outline"}
            size={20}
            color={showFavoritesOnly ? theme.white : theme.textSecondary}
          />
        </Pressable>
      </View>

      {renderCategoryFilter()}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredSnippets.length} snippet
          {filteredSnippets.length !== 1 ? "s" : ""}
          {selectedCategory !== "all" &&
            ` em ${
              DEFAULT_CATEGORIES.find((c) => c.id === selectedCategory)?.name
            }`}
          {showFavoritesOnly &&
            " favorito" + (filteredSnippets.length !== 1 ? "s" : "")}
        </Text>
      </View>

      <FlatList
        data={filteredSnippets}
        renderItem={renderSnippetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>Nenhum snippet encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== "all" || showFavoritesOnly
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro snippet de código!"}
            </Text>
            {!searchQuery &&
              selectedCategory === "all" &&
              !showFavoritesOnly && (
                <Pressable
                  style={styles.createButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.createButtonText}>
                    Criar Primeiro Snippet
                  </Text>
                </Pressable>
              )}
          </View>
        }
      />

      {renderCreateModal()}
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
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerAction: {
      padding: 8,
      marginLeft: 8,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    searchText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    filterButton: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    categoryChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
    },
    categoryTextActive: {
      color: theme.white,
    },
    statsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    statsText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    listContent: {
      padding: 16,
    },
    snippetCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    snippetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    snippetInfo: {
      flex: 1,
    },
    snippetTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    snippetTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      flex: 1,
    },
    snippetLanguage: {
      fontSize: 12,
      color: theme.textSecondary,
      textTransform: "uppercase",
      fontWeight: "500",
    },
    snippetActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      padding: 6,
    },
    snippetDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    codePreview: {
      backgroundColor: theme.subtleBg,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    codeText: {
      fontFamily: "monospace",
      fontSize: 12,
      color: theme.text,
      lineHeight: 18,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tag: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tagText: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.primary,
    },
    moreTags: {
      fontSize: 10,
      color: theme.textSecondary,
      alignSelf: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 32,
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
      marginBottom: 24,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    createButtonText: {
      color: theme.white,
      fontWeight: "600",
      fontSize: 16,
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
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    codeInput: {
      minHeight: 120,
      textAlignVertical: "top",
      fontFamily: "monospace",
      fontSize: 14,
    },
    descriptionInput: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    languageSelector: {
      flexDirection: "row",
      gap: 8,
    },
    languageChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    languageChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    languageText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.text,
    },
    languageTextActive: {
      color: theme.white,
    },
  });
