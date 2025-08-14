import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { Conversation } from "../types";
import { storageService } from "../services/storageService";
import { hapticFeedback } from "../utils";

interface SearchFilters {
  query: string;
  type: "all" | "code" | "explanation" | "review" | "general";
  dateRange: "all" | "today" | "week" | "month" | "year";
  language: string;
  tags: string[];
  favoritesOnly: boolean;
}

type SortOption = "recent" | "oldest" | "title" | "length";

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "kotlin",
  "swift",
  "dart",
  "react",
  "vue",
  "angular",
  "node",
  "express",
  "flutter",
];

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteConversations, setFavoriteConversations] = useState<
    Set<string>
  >(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "all",
    dateRange: "all",
    language: "",
    tags: [],
    favoritesOnly: false,
  });

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const loadedConversations = await storageService.getConversations();
      setConversations(loadedConversations);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const settings = await storageService.getSettings();
      const favorites = settings.favoriteConversations || [];
      setFavoriteConversations(new Set(favorites));
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  }, []);

  const saveFavorites = useCallback(async (favorites: Set<string>) => {
    try {
      const settings = await storageService.getSettings();
      await storageService.saveSettings({
        ...settings,
        favoriteConversations: Array.from(favorites),
      });
    } catch (error) {
      console.error("Erro ao salvar favoritos:", error);
    }
  }, []);

  const detectLanguageInConversation = useCallback(
    (conversation: Conversation): string[] => {
      const languages = new Set<string>();

      conversation.messages.forEach((message) => {
        if (message.content.includes("```")) {
          const codeBlocks = message.content.match(/```(\w+)/g);
          codeBlocks?.forEach((block) => {
            const lang = block.replace("```", "").toLowerCase();
            if (SUPPORTED_LANGUAGES.includes(lang)) {
              languages.add(lang);
            }
          });
        }

        SUPPORTED_LANGUAGES.forEach((lang) => {
          if (message.content.toLowerCase().includes(lang)) {
            languages.add(lang);
          }
        });
      });

      return Array.from(languages);
    },
    []
  );

  const generateAutoTags = useCallback(
    (conversation: Conversation): string[] => {
      const tags = new Set<string>();

      const messageTypes = new Set(
        conversation.messages.map((m) => m.type).filter(Boolean)
      );
      messageTypes.forEach((type) => {
        if (type) tags.add(type);
      });

      const languages = detectLanguageInConversation(conversation);
      languages.forEach((lang) => tags.add(lang));

      const keywords = [
        "debug",
        "error",
        "fix",
        "optimization",
        "performance",
        "react",
        "api",
        "database",
        "frontend",
        "backend",
        "mobile",
        "web",
        "algorithm",
      ];

      const content = conversation.messages
        .map((m) => m.content.toLowerCase())
        .join(" ");
      keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          tags.add(keyword);
        }
      });

      return Array.from(tags);
    },
    [detectLanguageInConversation]
  );

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (filters.favoritesOnly) {
      filtered = filtered.filter((conv) => favoriteConversations.has(conv.id));
    }

    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query) ||
          conv.messages.some((msg) =>
            msg.content.toLowerCase().includes(query)
          ) ||
          generateAutoTags(conv).some((tag) => tag.includes(query))
      );
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((conv) =>
        conv.messages.some((msg) => msg.type === filters.type)
      );
    }

    if (filters.language) {
      filtered = filtered.filter((conv) => {
        const languages = detectLanguageInConversation(conv);
        return languages.includes(filters.language.toLowerCase());
      });
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
        year: 365,
      };

      const daysAgo = ranges[filters.dateRange];
      const cutoffDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );

      filtered = filtered.filter((conv) => conv.updatedAt >= cutoffDate);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((conv) => {
        const autoTags = generateAutoTags(conv);
        return filters.tags.some((tag) => autoTags.includes(tag));
      });
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case "oldest":
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "length":
          return b.messages.length - a.messages.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    conversations,
    filters,
    sortOption,
    favoriteConversations,
    generateAutoTags,
    detectLanguageInConversation,
  ]);

  const toggleFavorite = useCallback(
    async (conversationId: string) => {
      const newFavorites = new Set(favoriteConversations);

      if (newFavorites.has(conversationId)) {
        newFavorites.delete(conversationId);
      } else {
        newFavorites.add(conversationId);
      }

      setFavoriteConversations(newFavorites);
      await saveFavorites(newFavorites);
      hapticFeedback.light();
    },
    [favoriteConversations, saveFavorites]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await storageService.deleteConversation(conversationId);
        await loadConversations();
        hapticFeedback.success();
      } catch (error) {
        Alert.alert("Erro", "Não foi possível excluir a conversa");
      }
    },
    [loadConversations]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      query: "",
      type: "all",
      dateRange: "all",
      language: "",
      tags: [],
      favoritesOnly: false,
    });
  }, []);

  useEffect(() => {
    loadConversations();
    loadFavorites();
  }, [loadConversations, loadFavorites]);

  return {
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
    loadConversations,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};
