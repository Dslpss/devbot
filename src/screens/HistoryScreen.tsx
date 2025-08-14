import React, { useState, useCallback } from "react";
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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { Conversation } from "../types";
import { ConversationPreview } from "../components/ConversationPreview";
import { useConversationHistory } from "../hooks/useConversationHistory";

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const {
    conversations,
    filteredConversations,
    loading,
    favoriteConversations,
    filters,
    sortOption,
    setFilters,
    setSortOption,
    toggleFavorite,
    deleteConversation,
    clearFilters,
    detectLanguageInConversation,
    generateAutoTags,
    supportedLanguages,
  } = useConversationHistory();

  const styles = createStyles(theme);

  const handleDeleteConversation = (conversation: Conversation) => {
    Alert.alert(
      "Excluir Conversa",
      `Tem certeza que deseja excluir "${conversation.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteConversation(conversation.id),
        },
      ]
    );
  };

  const handleShareConversation = async (conversation: Conversation) => {
    try {
      const content = `${conversation.title}\n\n${conversation.messages
        .map((msg) => `${msg.role === "user" ? "👤" : "🤖"}: ${msg.content}`)
        .join("\n\n")}`;

      await Share.share({
        message: content,
        title: conversation.title,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar a conversa");
    }
  };

  const handleExportHistory = async () => {
    try {
      const data = {
        conversations: filteredConversations,
        exportDate: new Date().toISOString(),
        totalConversations: filteredConversations.length,
      };

      const jsonString = JSON.stringify(data, null, 2);

      await Share.share({
        message: jsonString,
        title: "Histórico do DevBot",
      });

      setShowExportModal(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o histórico");
    }
  };

  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const tags = generateAutoTags(item);
      const languages = detectLanguageInConversation(item);
      const isFavorite = favoriteConversations.has(item.id);

      return (
        <ConversationPreview
          conversation={item}
          tags={tags}
          languages={languages}
          isFavorite={isFavorite}
          onPress={() =>
            navigation.navigate("Chat", { conversationId: item.id })
          }
          onToggleFavorite={() => toggleFavorite(item.id)}
          onShare={() => handleShareConversation(item)}
          onDelete={() => handleDeleteConversation(item)}
        />
      );
    },
    [
      navigation,
      generateAutoTags,
      detectLanguageInConversation,
      favoriteConversations,
      toggleFavorite,
    ]
  );

  const renderSearchModal = () => (
    <Modal
      visible={searchVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filtros de Busca</Text>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setSearchVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.filterLabel}>Buscar por palavra-chave</Text>
          <TextInput
            style={styles.searchInput}
            value={filters.query}
            onChangeText={(text) =>
              setFilters((prev) => ({ ...prev, query: text }))
            }
            placeholder="Digite para buscar..."
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.filterLabel}>Tipo de conversa</Text>
          <View style={styles.filterRow}>
            {[
              { key: "all", label: "Todas" },
              { key: "code", label: "Código" },
              { key: "explanation", label: "Explicações" },
              { key: "review", label: "Revisões" },
              { key: "general", label: "Geral" },
            ].map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.filterChip,
                  filters.type === option.key && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    type: option.key as any,
                  }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.type === option.key && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Período</Text>
          <View style={styles.filterRow}>
            {[
              { key: "all", label: "Todas" },
              { key: "today", label: "Hoje" },
              { key: "week", label: "Esta semana" },
              { key: "month", label: "Este mês" },
              { key: "year", label: "Este ano" },
            ].map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.filterChip,
                  filters.dateRange === option.key && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: option.key as any,
                  }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.dateRange === option.key &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.filterLabel}>Apenas favoritas</Text>
            <Switch
              value={filters.favoritesOnly}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  favoritesOnly: value,
                }))
              }
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={
                filters.favoritesOnly ? theme.primary : theme.textSecondary
              }
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Limpar Filtros</Text>
            </Pressable>

            <Pressable
              style={styles.applyButton}
              onPress={() => setSearchVisible(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </Pressable>
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
          <Text style={styles.loadingText}>Carregando histórico...</Text>
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

        <Text style={styles.title}>Histórico</Text>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerAction}
            onPress={() => setSearchVisible(true)}
          >
            <Ionicons name="search" size={22} color={theme.text} />
          </Pressable>

          <Pressable
            style={styles.headerAction}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="download-outline" size={22} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredConversations.length} de {conversations.length} conversas
        </Text>
        <Text style={styles.statsText}>
          {favoriteConversations.size} favoritas
        </Text>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "recent", label: "Mais recentes" },
            { key: "oldest", label: "Mais antigas" },
            { key: "title", label: "Título" },
            { key: "length", label: "Mais mensagens" },
          ].map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.sortOption,
                sortOption === option.key && styles.sortOptionActive,
              ]}
              onPress={() => setSortOption(option.key as any)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortOption === option.key && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={80} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>
            {conversations.length === 0
              ? "Nenhuma conversa ainda"
              : "Nenhuma conversa encontrada"}
          </Text>
          <Text style={styles.emptyText}>
            {conversations.length === 0
              ? "Inicie uma conversa com o DevBot para ver o histórico aqui"
              : "Tente ajustar os filtros de busca"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}

      {renderSearchModal()}

      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.exportModalOverlay}>
          <View style={styles.exportModalContent}>
            <Text style={styles.exportModalTitle}>Exportar Histórico</Text>
            <Text style={styles.exportModalText}>
              Deseja exportar {filteredConversations.length} conversas?
            </Text>

            <View style={styles.exportModalActions}>
              <Pressable
                style={styles.exportCancelButton}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.exportCancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.exportConfirmButton}
                onPress={handleExportHistory}
              >
                <Text style={styles.exportConfirmText}>Exportar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerAction: {
      padding: 8,
      marginLeft: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.surface,
    },
    statsText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    sortContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sortLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
    },
    sortOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    sortOptionText: {
      fontSize: 12,
      color: theme.text,
    },
    sortOptionTextActive: {
      color: theme.white,
    },
    listContent: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    modalCloseButton: {
      padding: 8,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
      marginTop: 16,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
      marginBottom: 8,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: theme.text,
    },
    filterChipTextActive: {
      color: theme.white,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
    },
    clearButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    clearButtonText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    applyButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
      alignItems: "center",
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.white,
    },
    exportModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    exportModalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 320,
    },
    exportModalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
      textAlign: "center",
    },
    exportModalText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 24,
      textAlign: "center",
      lineHeight: 22,
    },
    exportModalActions: {
      flexDirection: "row",
      gap: 12,
    },
    exportCancelButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    exportCancelText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    exportConfirmButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.primary,
      alignItems: "center",
    },
    exportConfirmText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.white,
    },
  });
