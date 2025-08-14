import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { validateInput, hapticFeedback } from "../utils";
import { useTheme } from "../contexts/ThemeContext";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCodeAnalysis?: () => void;
  onExplainConcept?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCodeAnalysis,
  onExplainConcept,
  isLoading = false,
  placeholder = "Digite sua dúvida ou código...",
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const styles = createStyles(theme);

  const handleSend = () => {
    const validation = validateInput(message);

    if (!validation.isValid) {
      Alert.alert("Atenção", validation.error);
      hapticFeedback.warning();
      return;
    }

    onSend(message.trim());
    setMessage("");
    hapticFeedback.light();
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);

    switch (action) {
      case "code":
        setMessage("Analise este código:\n```\n// Cole seu código aqui\n```");
        break;
      case "explain":
        setMessage("Explique o conceito: ");
        break;
      case "generate":
        setMessage("Gere código para: ");
        break;
      case "debug":
        setMessage(
          "Ajude-me a debugar este código:\n```\n// Cole seu código aqui\n```"
        );
        break;
    }

    hapticFeedback.light();
  };

  return (
    <View style={styles.container}>
      {/* Quick Actions */}
      {showQuickActions && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction("code")}
          >
            <Ionicons name="code-slash" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction("explain")}
          >
            <Ionicons name="book" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction("generate")}
          >
            <Ionicons name="create" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction("debug")}
          >
            <Ionicons name="bug" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.quickActionsButton}
          onPress={() => {
            setShowQuickActions(!showQuickActions);
            hapticFeedback.light();
          }}
        >
          <Ionicons
            name={showQuickActions ? "close" : "add"}
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={4000}
          editable={!isLoading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={styles.sendButtonContainer}
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
        >
          <LinearGradient
            colors={
              isLoading || !message.trim()
                ? [theme.textSecondary, theme.textSecondary]
                : [theme.primary, theme.primaryDark]
            }
            style={styles.sendButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={isLoading ? "hourglass" : "send"}
              size={20}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Character Counter */}
      {message.length > 3500 && (
        <View style={styles.characterCounter}>
          <Text
            style={[
              styles.counterText,
              message.length > 3900 && styles.counterWarning,
            ]}
          >
            {message.length}/4000
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
      paddingVertical: 8,
    },
    quickAction: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    quickActionsButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 4,
    },
    textInput: {
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
      lineHeight: 20,
    },
    sendButtonContainer: {
      marginLeft: 8,
      marginRight: 4,
      marginBottom: 4,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    characterCounter: {
      alignItems: "flex-end",
      marginTop: 4,
    },
    counterText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    counterWarning: {
      color: theme.warning,
      fontWeight: "600",
    },
  });
