import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Conversation,
  DevBotConfig,
  AppSettings,
  CodeSnippet,
  SnippetCollection,
} from "../types";

class StorageService {
  private static readonly CONVERSATIONS_KEY = "devbot_conversations";
  private static readonly CONFIG_KEY = "devbot_config";
  private static readonly SETTINGS_KEY = "devbot_settings";
  private static readonly THEME_SETTINGS_KEY = "devbot_theme_settings";
  private static readonly SNIPPETS_KEY = "devbot_snippets";
  private static readonly COLLECTIONS_KEY = "devbot_collections";

  // Conversas
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const existingIndex = conversations.findIndex(
        (c) => c.id === conversation.id
      );

      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation); // Adiciona no início
      }

      await AsyncStorage.setItem(
        StorageService.CONVERSATIONS_KEY,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error("Erro ao salvar conversa:", error);
      throw new Error("Não foi possível salvar a conversa");
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(StorageService.CONVERSATIONS_KEY);
      if (!data) return [];

      const conversations = JSON.parse(data);
      // Converte strings de data de volta para objetos Date
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      return [];
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.getConversations();
    return conversations.find((c) => c.id === id) || null;
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const filtered = conversations.filter((c) => c.id !== id);
      await AsyncStorage.setItem(
        StorageService.CONVERSATIONS_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
      throw new Error("Não foi possível deletar a conversa");
    }
  }

  async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageService.CONVERSATIONS_KEY);
    } catch (error) {
      console.error("Erro ao limpar conversas:", error);
      throw new Error("Não foi possível limpar as conversas");
    }
  }

  // Configurações
  async saveConfig(config: DevBotConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.CONFIG_KEY,
        JSON.stringify(config)
      );
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      throw new Error("Não foi possível salvar as configurações");
    }
  }

  async getConfig(): Promise<DevBotConfig> {
    try {
      const data = await AsyncStorage.getItem(StorageService.CONFIG_KEY);
      if (!data) {
        // Retorna configuração padrão
        return {
          maxTokens: 1000,
          temperature: 0.7,
          model: "gemini-2.0-flash",
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      return {
        maxTokens: 1000,
        temperature: 0.7,
        model: "gemini-2.0-flash",
      };
    }
  }

  // Configurações do App
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw new Error("Não foi possível salvar as configurações");
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(StorageService.SETTINGS_KEY);
      if (!data) {
        // Retorna configurações padrão
        return {
          theme: "auto",
          fontSize: "medium",
          hapticFeedback: true,
          autoSave: true,
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      return {
        theme: "auto",
        fontSize: "medium",
        hapticFeedback: true,
        autoSave: true,
      };
    }
  }

  // Snippets de Código
  async saveSnippet(snippet: CodeSnippet): Promise<void> {
    try {
      const snippets = await this.getSnippets();
      const existingIndex = snippets.findIndex((s) => s.id === snippet.id);

      if (existingIndex >= 0) {
        snippets[existingIndex] = snippet;
      } else {
        snippets.unshift(snippet);
      }

      await AsyncStorage.setItem(
        StorageService.SNIPPETS_KEY,
        JSON.stringify(snippets)
      );
    } catch (error) {
      console.error("Erro ao salvar snippet:", error);
      throw new Error("Não foi possível salvar o snippet");
    }
  }

  async getSnippets(): Promise<CodeSnippet[]> {
    try {
      const data = await AsyncStorage.getItem(StorageService.SNIPPETS_KEY);
      if (!data) return [];

      const snippets = JSON.parse(data);
      return snippets.map((snippet: any) => ({
        ...snippet,
        createdAt: new Date(snippet.createdAt),
        updatedAt: new Date(snippet.updatedAt),
      }));
    } catch (error) {
      console.error("Erro ao carregar snippets:", error);
      return [];
    }
  }

  async getSnippet(id: string): Promise<CodeSnippet | null> {
    const snippets = await this.getSnippets();
    return snippets.find((s) => s.id === id) || null;
  }

  async deleteSnippet(id: string): Promise<void> {
    try {
      const snippets = await this.getSnippets();
      const filtered = snippets.filter((s) => s.id !== id);
      await AsyncStorage.setItem(
        StorageService.SNIPPETS_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Erro ao deletar snippet:", error);
      throw new Error("Não foi possível deletar o snippet");
    }
  }

  async searchSnippets(
    query: string,
    filters?: {
      language?: string;
      category?: string;
      tags?: string[];
      isFavorite?: boolean;
    }
  ): Promise<CodeSnippet[]> {
    try {
      const snippets = await this.getSnippets();

      return snippets.filter((snippet) => {
        // Busca por texto
        const matchesQuery =
          !query ||
          snippet.title.toLowerCase().includes(query.toLowerCase()) ||
          snippet.code.toLowerCase().includes(query.toLowerCase()) ||
          snippet.description?.toLowerCase().includes(query.toLowerCase()) ||
          snippet.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          );

        // Filtros
        const matchesLanguage =
          !filters?.language || snippet.language === filters.language;
        const matchesCategory =
          !filters?.category || snippet.category === filters.category;
        const matchesFavorite =
          filters?.isFavorite === undefined ||
          snippet.isFavorite === filters.isFavorite;
        const matchesTags =
          !filters?.tags?.length ||
          filters.tags.some((tag) => snippet.tags.includes(tag));

        return (
          matchesQuery &&
          matchesLanguage &&
          matchesCategory &&
          matchesFavorite &&
          matchesTags
        );
      });
    } catch (error) {
      console.error("Erro ao buscar snippets:", error);
      return [];
    }
  }

  // Coleções de Snippets
  async saveCollection(collection: SnippetCollection): Promise<void> {
    try {
      const collections = await this.getCollections();
      const existingIndex = collections.findIndex(
        (c) => c.id === collection.id
      );

      if (existingIndex >= 0) {
        collections[existingIndex] = collection;
      } else {
        collections.unshift(collection);
      }

      await AsyncStorage.setItem(
        StorageService.COLLECTIONS_KEY,
        JSON.stringify(collections)
      );
    } catch (error) {
      console.error("Erro ao salvar coleção:", error);
      throw new Error("Não foi possível salvar a coleção");
    }
  }

  async getCollections(): Promise<SnippetCollection[]> {
    try {
      const data = await AsyncStorage.getItem(StorageService.COLLECTIONS_KEY);
      if (!data) return [];

      const collections = JSON.parse(data);
      return collections.map((collection: any) => ({
        ...collection,
        createdAt: new Date(collection.createdAt),
        snippets: collection.snippets.map((snippet: any) => ({
          ...snippet,
          createdAt: new Date(snippet.createdAt),
          updatedAt: new Date(snippet.updatedAt),
        })),
      }));
    } catch (error) {
      console.error("Erro ao carregar coleções:", error);
      return [];
    }
  }

  async deleteCollection(id: string): Promise<void> {
    try {
      const collections = await this.getCollections();
      const filtered = collections.filter((c) => c.id !== id);
      await AsyncStorage.setItem(
        StorageService.COLLECTIONS_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Erro ao deletar coleção:", error);
      throw new Error("Não foi possível deletar a coleção");
    }
  }

  async exportSnippets(): Promise<string> {
    try {
      const snippets = await this.getSnippets();
      const collections = await this.getCollections();

      return JSON.stringify(
        {
          snippets,
          collections,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        },
        null,
        2
      );
    } catch (error) {
      console.error("Erro ao exportar snippets:", error);
      throw new Error("Não foi possível exportar os snippets");
    }
  }

  async importSnippets(
    data: string
  ): Promise<{ snippets: number; collections: number }> {
    try {
      const imported = JSON.parse(data);

      if (!imported.snippets && !imported.collections) {
        throw new Error("Formato de arquivo inválido");
      }

      let snippetsCount = 0;
      let collectionsCount = 0;

      if (imported.snippets) {
        const currentSnippets = await this.getSnippets();
        const newSnippets = imported.snippets.filter(
          (importedSnippet: CodeSnippet) =>
            !currentSnippets.some(
              (existing) => existing.id === importedSnippet.id
            )
        );

        for (const snippet of newSnippets) {
          await this.saveSnippet(snippet);
          snippetsCount++;
        }
      }

      if (imported.collections) {
        const currentCollections = await this.getCollections();
        const newCollections = imported.collections.filter(
          (importedCollection: SnippetCollection) =>
            !currentCollections.some(
              (existing) => existing.id === importedCollection.id
            )
        );

        for (const collection of newCollections) {
          await this.saveCollection(collection);
          collectionsCount++;
        }
      }

      return { snippets: snippetsCount, collections: collectionsCount };
    } catch (error) {
      console.error("Erro ao importar snippets:", error);
      throw new Error("Não foi possível importar os snippets");
    }
  }

  // Configurações de Tema
  async saveThemeSettings(themeSettings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.THEME_SETTINGS_KEY,
        JSON.stringify(themeSettings)
      );
    } catch (error) {
      console.error("Erro ao salvar configurações de tema:", error);
      throw new Error("Não foi possível salvar as configurações de tema");
    }
  }

  async getThemeSettings(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(
        StorageService.THEME_SETTINGS_KEY
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao carregar configurações de tema:", error);
      return null;
    }
  }

  // Utilitários
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        StorageService.CONVERSATIONS_KEY,
        StorageService.CONFIG_KEY,
        StorageService.SETTINGS_KEY,
        StorageService.THEME_SETTINGS_KEY,
        StorageService.SNIPPETS_KEY,
        StorageService.COLLECTIONS_KEY,
      ]);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw new Error("Não foi possível limpar os dados");
    }
  }

  // Métodos genéricos para qualquer tipo de dados
  async saveData<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Erro ao salvar dados (${key}):`, error);
      throw new Error(`Não foi possível salvar os dados: ${key}`);
    }
  }

  async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Erro ao carregar dados (${key}):`, error);
      return null;
    }
  }

  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover dados (${key}):`, error);
      throw new Error(`Não foi possível remover os dados: ${key}`);
    }
  }

  async getStorageInfo(): Promise<{
    used: number;
    conversations: number;
    snippets: number;
  }> {
    try {
      const conversations = await this.getConversations();
      const snippets = await this.getSnippets();
      const allKeys = await AsyncStorage.getAllKeys();
      const devbotKeys = allKeys.filter((key) => key.startsWith("devbot_"));

      return {
        used: devbotKeys.length,
        conversations: conversations.length,
        snippets: snippets.length,
      };
    } catch (error) {
      console.error("Erro ao obter informações de armazenamento:", error);
      return { used: 0, conversations: 0, snippets: 0 };
    }
  }
}

export const storageService = new StorageService();
