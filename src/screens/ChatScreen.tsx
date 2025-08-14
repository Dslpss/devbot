import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { Message, Conversation, CodeSnippet } from "../types";
import { geminiService } from "../services/geminiService";
import { storageService } from "../services/storageService";
import { ProgressService } from "../services/progressService";
import {
  generateId,
  formatConversationTitle,
  hapticFeedback,
  detectLanguage,
} from "../utils";
import { useTheme } from "../contexts/ThemeContext";

interface ChatScreenProps {
  route?: {
    params?: {
      conversationId?: string;
    };
  };
  navigation?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const conversationId = route?.params?.conversationId;

  const styles = createStyles(theme);

  useEffect(() => {
    checkApiKey();
    loadConversation();
  }, [conversationId]);

  const checkApiKey = async () => {
    try {
      const config = await storageService.getConfig();
      const hasKey = !!config.apiKey;
      setHasApiKey(true); // Sempre true pois temos a key no env.ts

      // Sempre configura o serviço, mesmo que não tenha key no storage
      geminiService.setConfig(config);
    } catch (error) {
      console.error("Erro ao verificar API key:", error);
      setHasApiKey(true); // Mantém true pois temos fallback
    }
  };

  const loadConversation = async () => {
    if (conversationId) {
      try {
        const loadedConversation = await storageService.getConversation(
          conversationId
        );
        if (loadedConversation) {
          setConversation(loadedConversation);
          setMessages(loadedConversation.messages);
        }
      } catch (error) {
        console.error("Erro ao carregar conversa:", error);
        Alert.alert("Erro", "Não foi possível carregar a conversa");
      }
    }
  };

  const createNewConversation = (firstMessage: string): Conversation => {
    const now = new Date();
    return {
      id: generateId(),
      title: formatConversationTitle(firstMessage),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  };

  const saveConversation = async (updatedConversation: Conversation) => {
    try {
      await storageService.saveConversation(updatedConversation);
      setConversation(updatedConversation);
    } catch (error) {
      console.error("Erro ao salvar conversa:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!hasApiKey) {
      Alert.alert(
        "API Key necessária",
        "Configure sua API Key do Gemini nas configurações para usar o DevBot.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Configurar",
            onPress: () => navigation?.navigate("Settings"),
          },
        ]
      );
      return;
    }

    // Detecta tipo de mensagem
    const messageType = content.includes("```")
      ? "code"
      : content.toLowerCase().includes("explique")
      ? "explanation"
      : content.toLowerCase().includes("analise") ||
        content.toLowerCase().includes("revise")
      ? "review"
      : "general";

    // Cria mensagem do usuário
    const userMessage: Message = {
      id: generateId(),
      content,
      role: "user",
      timestamp: new Date(),
      type: messageType,
    };

    // Atualiza estado
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Scroll para baixo
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Cria ou atualiza conversa
      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = createNewConversation(content);
      }

      currentConversation.messages = updatedMessages;
      currentConversation.updatedAt = new Date();

      // Detecta linguagem se for código
      const detectedLanguage =
        messageType === "code" ? detectLanguage(content) : undefined;

      // Detecta tópico baseado no tipo de mensagem
      const detectedTopic =
        messageType === "code"
          ? "analise"
          : messageType === "explanation"
          ? "conceito"
          : messageType === "review"
          ? "revisao"
          : "geral";

      // Chama API Gemini
      let response: string;

      if (messageType === "code") {
        const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
        if (codeMatch) {
          const code = codeMatch[1];
          const language = detectLanguage(code);
          response = await geminiService.analyzeCode(code, language);

          // Rastreia análise de código
          ProgressService.trackActivity("codeAnalysis", {
            language: language || detectedLanguage,
            topic: "analise",
          });
        } else {
          response = await geminiService.sendMessage(
            content,
            messages.slice(-5)
          );

          // Rastreia pergunta geral
          ProgressService.trackActivity("question", {
            language: detectedLanguage,
            topic: detectedTopic,
          });
        }
      } else if (messageType === "explanation") {
        const conceptMatch = content.match(/explique (?:o conceito )?(.+)/i);
        const concept = conceptMatch ? conceptMatch[1] : content;
        response = await geminiService.explainConcept(concept);

        // Rastreia pergunta de explicação
        ProgressService.trackActivity("question", {
          topic: "conceito",
        });
      } else {
        response = await geminiService.sendMessage(content, messages.slice(-5));

        // Rastreia pergunta geral
        ProgressService.trackActivity("question", {
          language: detectedLanguage,
          topic: detectedTopic,
        });
      }

      // Cria mensagem de resposta
      const botMessage: Message = {
        id: generateId(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
        type: messageType,
      };

      // Atualiza mensagens e conversa
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      currentConversation.messages = finalMessages;
      await saveConversation(currentConversation);

      hapticFeedback.success();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar sua mensagem. Tente novamente."
      );
      hapticFeedback.error();

      // Remove mensagem do usuário em caso de erro
      setMessages(messages);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await Clipboard.setStringAsync(content);
      Alert.alert("Sucesso", "Mensagem copiada para a área de transferência");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar a mensagem");
    }
  };

  const handleSaveAsSnippet = async (content: string) => {
    try {
      // Extrai código dos blocos markdown
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (!codeBlocks || codeBlocks.length === 0) {
        Alert.alert(
          "Aviso",
          "Nenhum bloco de código encontrado nesta mensagem"
        );
        return;
      }

      // Usa o primeiro bloco de código encontrado
      let code = codeBlocks[0];
      code = code
        .replace(/```(\w+)?\n?/, "")
        .replace(/```$/, "")
        .trim();

      // Detecta a linguagem
      const languageMatch = codeBlocks[0].match(/```(\w+)/);
      const language =
        languageMatch?.[1] || detectLanguage(code) || "javascript";

      // Cria o snippet
      const snippet: CodeSnippet = {
        id: generateId(),
        title: `Código do Chat - ${new Date().toLocaleDateString()}`,
        code,
        language,
        category:
          language === "javascript" || language === "typescript"
            ? language
            : "other",
        description: "Código gerado pelo DevBot durante conversa",
        tags: ["devbot", "chat", language],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        source: "generated",
      };

      await storageService.saveSnippet(snippet);

      Alert.alert(
        "Snippet Salvo!",
        "O código foi salvo na sua biblioteca de snippets.",
        [
          { text: "OK" },
          {
            text: "Ver Snippets",
            onPress: () => navigation?.navigate("Snippets"),
          },
        ]
      );

      hapticFeedback.success();
    } catch (error) {
      console.error("Erro ao salvar snippet:", error);
      Alert.alert("Erro", "Não foi possível salvar o snippet");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item}
      onCopy={handleCopyMessage}
      onSaveAsSnippet={handleSaveAsSnippet}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles" size={80} color={theme.textSecondary} />
      <Text style={styles.emptyTitle}>Olá! Sou o DevBot 🤖</Text>
      <Text style={styles.emptySubtitle}>
        Estou aqui para ajudar com suas dúvidas de programação!
      </Text>
      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>
          Você pode me perguntar sobre:
        </Text>
        <Text style={styles.suggestion}>• Explicações de conceitos</Text>
        <Text style={styles.suggestion}>• Análise de código</Text>
        <Text style={styles.suggestion}>• Geração de exemplos</Text>
        <Text style={styles.suggestion}>• Debugging e otimização</Text>
      </View>
    </View>
  );

  const startNewChat = () => {
    Alert.alert(
      "Novo Chat",
      "Deseja iniciar uma nova conversa? A conversa atual será salva.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Novo Chat",
          onPress: () => {
            // Limpa mensagens atuais
            setMessages([]);
            setConversation(null);
            hapticFeedback.success();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          {navigation && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
          )}

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>
              {conversation?.title || "Nova Conversa"}
            </Text>
            {!hasApiKey && (
              <Text style={styles.headerSubtitle}>API Key não configurada</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => navigation?.navigate("History")}
          >
            <Ionicons name="time-outline" size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => navigation?.navigate("Settings")}
          >
            <Ionicons name="settings" size={24} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerAction} onPress={startNewChat}>
            <Ionicons name="add-circle-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={messages.length === 0 && styles.emptyContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder={
            hasApiKey
              ? "Digite sua dúvida ou código..."
              : "Configure sua API Key primeiro"
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
    },
    headerTitleText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.warning,
      marginTop: 2,
    },
    headerAction: {
      marginLeft: 12,
    },
    messagesList: {
      flex: 1,
      backgroundColor: theme.background,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginTop: 16,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 22,
    },
    suggestions: {
      marginTop: 32,
      alignSelf: "stretch",
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
      textAlign: "center",
    },
    suggestion: {
      fontSize: 14,
      color: theme.textSecondary,
      marginVertical: 4,
      paddingLeft: 16,
    },
  });
