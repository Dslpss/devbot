import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PromptTemplate } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface TemplateCardProps {
  template: PromptTemplate;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const getCategoryIcon = (category: PromptTemplate["category"]) => {
  switch (category) {
    case "code":
      return "code-outline";
    case "explanation":
      return "book-outline";
    case "analysis":
      return "analytics-outline";
    case "conversion":
      return "swap-horizontal-outline";
    case "example":
      return "bulb-outline";
    case "custom":
      return "settings-outline";
    default:
      return "document-outline";
  }
};

const getCategoryColor = (category: PromptTemplate["category"], theme: any) => {
  switch (category) {
    case "code":
      return "#2196F3";
    case "explanation":
      return "#4CAF50";
    case "analysis":
      return "#FF9800";
    case "conversion":
      return "#9C27B0";
    case "example":
      return "#FFC107";
    case "custom":
      return theme.primary;
    default:
      return theme.textSecondary;
  }
};

export const TemplateCard: React.FC<TemplateCardProps> = memo(
  ({
    template,
    onPress,
    onEdit,
    onDelete,
    onDuplicate,
    showActions = true,
    compact = false,
  }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme, compact);

    const categoryColor = getCategoryColor(template.category, theme);
    const categoryIcon = getCategoryIcon(template.category);

    return (
      <Pressable style={styles.container} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <View
              style={[styles.categoryBadge, { backgroundColor: categoryColor }]}
            >
              <Ionicons name={categoryIcon as any} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.categoryText}>
              {template.category.charAt(0).toUpperCase() +
                template.category.slice(1)}
            </Text>
          </View>

          {showActions && (
            <View style={styles.actionsContainer}>
              {template.isCustom && onEdit && (
                <Pressable style={styles.actionButton} onPress={onEdit}>
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}

              {onDuplicate && (
                <Pressable style={styles.actionButton} onPress={onDuplicate}>
                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}

              {template.isCustom && onDelete && (
                <Pressable style={styles.actionButton} onPress={onDelete}>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={theme.error}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {template.title}
        </Text>

        {template.description && (
          <Text style={styles.description} numberOfLines={3}>
            {template.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons
                name="play-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.statText}>{template.usageCount}</Text>
            </View>

            {template.variables && template.variables.length > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="options-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.statText}>
                  {template.variables.length} vars
                </Text>
              </View>
            )}
          </View>

          {template.isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Customizado</Text>
            </View>
          )}
        </View>

        {template.variables && template.variables.length > 0 && !compact && (
          <View style={styles.variablesContainer}>
            {template.variables.slice(0, 3).map((variable) => (
              <View key={variable} style={styles.variableTag}>
                <Text style={styles.variableTagText}>{variable}</Text>
              </View>
            ))}
            {template.variables.length > 3 && (
              <Text style={styles.moreVariables}>
                +{template.variables.length - 3} mais
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

const createStyles = (theme: any, compact: boolean = false) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: compact ? 12 : 16,
      marginBottom: compact ? 8 : 12,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: compact ? 120 : undefined,
      maxHeight: compact ? 160 : undefined,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: compact ? 8 : 12,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    categoryBadge: {
      width: compact ? 20 : 24,
      height: compact ? 20 : 24,
      borderRadius: compact ? 10 : 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: compact ? 6 : 8,
    },
    categoryText: {
      fontSize: compact ? 10 : 12,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: compact ? 4 : 6,
      marginLeft: 4,
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: compact ? 6 : 8,
      lineHeight: compact ? 18 : 22,
    },
    description: {
      fontSize: compact ? 12 : 14,
      color: theme.textSecondary,
      lineHeight: compact ? 16 : 20,
      marginBottom: compact ? 8 : 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: compact ? 4 : 8,
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    statText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    customBadge: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    customBadgeText: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.primary,
    },
    variablesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
    },
    variableTag: {
      backgroundColor: theme.surface,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    variableTagText: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    moreVariables: {
      fontSize: 10,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
  });
