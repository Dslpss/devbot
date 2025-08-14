import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Conversation } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface ConversationPreviewProps {
  conversation: Conversation;
  tags: string[];
  languages: string[];
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const ConversationPreview: React.FC<ConversationPreviewProps> = memo(
  ({
    conversation,
    tags,
    languages,
    isFavorite,
    onPress,
    onToggleFavorite,
    onShare,
    onDelete,
  }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const messageCount = conversation.messages.length;
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    return (
      <Pressable style={styles.conversationCard} onPress={onPress}>
        <View style={styles.conversationHeader}>
          <View style={styles.conversationInfo}>
            <Text style={styles.conversationTitle} numberOfLines={2}>
              {conversation.title}
            </Text>
            <Text style={styles.conversationDate}>
              {conversation.updatedAt.toLocaleDateString()} • {messageCount}{" "}
              mensagens
            </Text>
          </View>

          <View style={styles.conversationActions}>
            <Pressable style={styles.actionButton} onPress={onToggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? theme.error : theme.textSecondary}
              />
            </Pressable>

            <Pressable style={styles.actionButton} onPress={onShare}>
              <Ionicons name="share-outline" size={20} color={theme.primary} />
            </Pressable>

            <Pressable style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color={theme.error} />
            </Pressable>
          </View>
        </View>

        {lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {lastMessage.content.length > 100
              ? lastMessage.content.substring(0, 100) + "..."
              : lastMessage.content}
          </Text>
        )}

        {(languages.length > 0 || tags.length > 0) && (
          <View style={styles.tagsContainer}>
            {languages.slice(0, 3).map((lang) => (
              <View key={lang} style={[styles.tag, styles.languageTag]}>
                <Text style={styles.tagText}>{lang}</Text>
              </View>
            ))}
            {tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {languages.length + tags.length > 6 && (
              <Text style={styles.moreTags}>
                +{languages.length + tags.length - 6}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

ConversationPreview.displayName = "ConversationPreview";

const createStyles = (theme: any) =>
  StyleSheet.create({
    conversationCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    conversationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    conversationInfo: {
      flex: 1,
      marginRight: 12,
    },
    conversationTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    conversationDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    conversationActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    lastMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
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
    languageTag: {
      backgroundColor: theme.warning + "20",
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
  });
