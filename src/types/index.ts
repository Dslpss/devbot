// Tipos principais do DevBot

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: "code" | "explanation" | "review" | "general";
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DevBotConfig {
  apiKey?: string;
  maxTokens: number;
  temperature: number;
  model: string;
}

export interface CodeAnalysis {
  language: string;
  suggestions: string[];
  issues: CodeIssue[];
  complexity: "low" | "medium" | "high";
}

export interface CodeIssue {
  line?: number;
  type: "error" | "warning" | "suggestion";
  message: string;
  severity: "low" | "medium" | "high";
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  hapticFeedback: boolean;
  autoSave: boolean;
  favoriteConversations?: string[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  category:
    | "code"
    | "explanation"
    | "analysis"
    | "conversion"
    | "example"
    | "custom";
  isCustom: boolean;
  variables?: string[]; // Variables like {language}, {code}, {concept}
  createdAt: Date;
  updatedAt?: Date;
  usageCount: number;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  source?: "generated" | "imported" | "manual";
}

export interface SnippetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SnippetCollection {
  id: string;
  name: string;
  description?: string;
  snippets: CodeSnippet[];
  createdAt: Date;
  isPublic: boolean;
}

export type NavigationStackParamList = {
  Home: undefined;
  Chat: { conversationId?: string };
  History: undefined;
  Settings: undefined;
  CodeAnalysis: undefined;
};
