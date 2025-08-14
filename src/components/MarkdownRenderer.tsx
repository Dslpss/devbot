import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { colors, hapticFeedback } from "../utils";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isUser = false,
}) => {
  // Função para copiar código
  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      hapticFeedback.success();
      Alert.alert("✅ Copiado!", "Código copiado para a área de transferência");
    } catch (error) {
      hapticFeedback.error();
      Alert.alert("❌ Erro", "Não foi possível copiar o código");
    }
  };

  // Verifica se tem blocos de código
  const hasCodeBlocks = content.includes("```");

  if (!hasCodeBlocks) {
    // Renderiza texto simples
    return (
      <Text style={[styles.normalText, isUser && styles.userNormalText]}>
        {content}
      </Text>
    );
  }

  // Divide o conteúdo em blocos de código e texto normal
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <View style={styles.container}>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Bloco de código
          const codeContent = part.slice(3, -3);
          const lines = codeContent.split("\n");
          const language = lines[0].trim();
          const code = lines
            .slice(language ? 1 : 0)
            .join("\n")
            .trim();

          return (
            <View key={index} style={styles.codeBlock}>
              <View style={styles.codeHeader}>
                <Text style={styles.codeLanguage}>{language || "CÓDIGO"}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(code)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color={colors.textDark}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                style={styles.codeContainer}
                showsHorizontalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
              >
                <View style={{ width: 2000 }}>
                  <Text
                    style={[styles.codeText, isUser && styles.userCodeText]}
                    selectable={true}
                  >
                    {code}
                  </Text>
                </View>
              </ScrollView>
            </View>
          );
        } else if (part.trim()) {
          // Texto normal
          return (
            <Text
              key={index}
              style={[styles.normalText, isUser && styles.userNormalText]}
            >
              {part}
            </Text>
          );
        }
        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  codeBlock: {
    backgroundColor: colors.codeDark,
    borderRadius: 8,
    marginVertical: 8,
    width: "100%",
  },
  codeHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeLanguage: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    flex: 1,
  },
  copyButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  codeContainer: {
    width: "100%",
    backgroundColor: colors.codeDark,
    borderRadius: 8,
    maxHeight: 300, // Limita altura para não ocupar tela toda
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: colors.text,
    padding: 12,
    lineHeight: 20,
    width: 2000, // Largura fixa bem grande
  },
  userCodeText: {
    color: colors.textDark,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  userNormalText: {
    color: colors.textDark,
  },
});
