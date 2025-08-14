import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Message } from "../types";
import { formatTimestamp, hapticFeedback } from "../utils";
import { useTheme } from "../contexts/ThemeContext";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageProps {
  message: Message;
  onCopy?: (content: string) => void;
  onSaveAsSnippet?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onCopy,
  onSaveAsSnippet,
}) => {
  const { theme } = useTheme();
  const isUser = message.role === "user";
  const isCode = message.type === "code" || message.content.includes("```");

  const styles = createStyles(theme);

  const handleLongPress = () => {
    hapticFeedback.medium();
    const options: any[] = [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Copiar",
        onPress: () => {
          onCopy?.(message.content);
          hapticFeedback.success();
        },
      },
    ];

    // Adiciona opção de salvar como snippet se for código e não for mensagem do usuário
    if (isCode && !isUser && onSaveAsSnippet) {
      options.splice(1, 0, {
        text: "Salvar como Snippet",
        onPress: () => {
          onSaveAsSnippet(message.content);
          hapticFeedback.success();
        },
      });
    }

    Alert.alert("Opções", "O que você gostaria de fazer?", options);
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
      ]}
    >
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
        style={{ flex: 1 }}
        disabled={isCode} // Desabilita touch quando há código para permitir scroll
      >
        {isUser ? (
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.bubble,
              styles.userBubble,
              isCode && styles.codeBubble,
            ]}
          >
            <MarkdownRenderer content={message.content} isUser={true} />

            <Text style={[styles.timestamp, styles.userTimestamp]}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.bubble,
              styles.botBubble,
              isCode && styles.codeBubble,
            ]}
          >
            <MarkdownRenderer content={message.content} isUser={false} />

            <Text style={[styles.timestamp, styles.botTimestamp]}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {message.type && (
        <View
          style={[
            styles.typeBadge,
            isUser ? styles.userTypeBadge : styles.botTypeBadge,
          ]}
        >
          <Text style={styles.typeText}>
            {message.type === "code" && "���"}
            {message.type === "explanation" && "���"}
            {message.type === "review" && "���"}
            {message.type === "general" && "���"}
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 4,
      marginHorizontal: 16,
    },
    userContainer: {
      alignItems: "flex-end",
    },
    botContainer: {
      alignItems: "flex-start",
    },
    bubble: {
      maxWidth: "85%",
      padding: 12,
      borderRadius: 18,
      position: "relative",
    },
    userBubble: {
      borderBottomRightRadius: 4,
    },
    botBubble: {
      backgroundColor: theme.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    codeBubble: {
      backgroundColor: theme.subtleBg,
      borderRadius: 8,
      maxWidth: "98%", // Quase toda a largura da tela
      overflow: "visible", // Permite que o conteúdo saia dos limites
    },
    text: {
      fontSize: 16,
      lineHeight: 22,
    },
    userText: {
      color: theme.textInverse,
      fontWeight: "500",
    },
    botText: {
      color: theme.text,
    },
    codeText: {
      fontFamily: "monospace",
      fontSize: 14,
    },
    timestamp: {
      fontSize: 11,
      marginTop: 4,
      opacity: 0.7,
    },
    userTimestamp: {
      color: theme.textInverse,
      textAlign: "right",
    },
    botTimestamp: {
      color: theme.textSecondary,
      textAlign: "left",
    },
    typeBadge: {
      position: "absolute",
      top: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    userTypeBadge: {
      right: 8,
      backgroundColor: theme.primary,
      borderColor: theme.background,
    },
    botTypeBadge: {
      left: 8,
      backgroundColor: theme.primary,
      borderColor: theme.background,
    },
    typeText: {
      fontSize: 10,
    },
  });
