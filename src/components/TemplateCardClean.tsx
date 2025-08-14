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
  }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

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
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}

              {onDuplicate && (
                <Pressable style={styles.actionButton} onPress={onDuplicate}>
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}

              {template.isCustom && onDelete && (
                <Pressable style={styles.actionButton} onPress={onDelete}>
                  <Ionicons
                    name="trash-outline"
                    size={16}
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
          <Text style={styles.description} numberOfLines={2}>
            {template.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons
                name="play-outline"
                size={12}
                color={theme.textSecondary}
              />
              <Text style={styles.statText}>{template.usageCount} usos</Text>
            </View>

            {template.variables && template.variables.length > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="options-outline"
                  size={12}
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
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          )}
        </View>

        {template.variables && template.variables.length > 0 && (
          <View style={styles.variablesContainer}>
            {template.variables.slice(0, 4).map((variable) => (
              <View key={variable} style={styles.variableTag}>
                <Text style={styles.variableTagText}>{variable}</Text>
              </View>
            ))}
            {template.variables.length > 4 && (
              <Text style={styles.moreVariables}>
                +{template.variables.length - 4}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    categoryBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      lineHeight: 22,
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
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
      paddingVertical: 4,
      borderRadius: 12,
    },
    customBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.primary,
    },
    variablesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },
    variableTag: {
      backgroundColor: theme.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    variableTagText: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    moreVariables: {
      fontSize: 10,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
  });
