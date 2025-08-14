import * as Haptics from "expo-haptics";

// Gerador de IDs únicos
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Formatação de data/hora
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Formatação de texto para conversas
export const formatConversationTitle = (firstMessage: string): string => {
  const maxLength = 30;
  const cleaned = firstMessage.trim().replace(/\n/g, " ");

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + "...";
};

// Detecção de linguagem de programação
export const detectLanguage = (code: string): string => {
  const patterns = {
    javascript: /(?:function|const|let|var|=>|console\.log)/,
    typescript: /(?:interface|type|enum|as\s+\w+|:\s*\w+\[\])/,
    python: /(?:def|import|from|print\(|if __name__|:\s*$)/m,
    java: /(?:public class|private|protected|void|System\.out)/,
    cpp: /(?:#include|using namespace|cout|cin)/,
    csharp: /(?:using System|public class|Console\.WriteLine|var\s+\w+\s*=)/,
    swift: /(?:func|var|let|import|print\()/,
    kotlin: /(?:fun|val|var|println\()/,
    php: /(?:<\?php|\$\w+|echo|function)/,
    ruby: /(?:def|puts|require|class.*<)/,
    go: /(?:func|package|import|fmt\.)/,
    rust: /(?:fn|let|mut|println!|use)/,
    html: /(?:<html|<!DOCTYPE|<div|<span)/,
    css: /(?:\.[\w-]+\s*{|#[\w-]+\s*{|@media)/,
    sql: /(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/i,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return "text";
};

// Validação de API Key
export const validateApiKey = (key: string): boolean => {
  // API Keys do Gemini geralmente começam com 'AI' e têm formato específico
  return /^AI[a-zA-Z0-9_-]{35,}$/.test(key.trim());
};

// Feedback háptico
export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Limpeza e formatação de código
export const formatCode = (code: string): string => {
  return code
    .trim()
    .replace(/^\`\`\`\w*\n?/, "") // Remove abertura de code block
    .replace(/\n?\`\`\`$/, ""); // Remove fechamento de code block
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Escape HTML
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Validação de entrada
export const validateInput = (
  input: string
): { isValid: boolean; error?: string } => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { isValid: false, error: "Por favor, digite uma mensagem" };
  }

  if (trimmed.length > 4000) {
    return {
      isValid: false,
      error: "Mensagem muito longa (máximo 4000 caracteres)",
    };
  }

  return { isValid: true };
};

// Cores do tema
export const colors = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  gradientStart: "#6366F1",
  gradientEnd: "#4F46E5",

  secondary: "#F59E0B",
  secondaryLight: "#FCD34D",
  secondaryDark: "#D97706",

  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  background: "#FFFFFF",
  backgroundDark: "#111827",

  surface: "#F9FAFB",
  surfaceDark: "#1F2937",

  card: "#FFFFFF",
  white: "#FFFFFF",

  text: "#111827",
  textDark: "#F9FAFB",
  textSecondary: "#6B7280",
  textSecondaryDark: "#9CA3AF",

  border: "#E5E7EB",
  borderDark: "#374151",

  code: "#F3F4F6",
  codeDark: "#374151",
  subtleBg: "#F1F5F9",
};
