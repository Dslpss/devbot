import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DailyStats,
  ProgressData,
  LanguageStats,
  TopicStats,
  WeeklyStats,
  MonthlyStats,
} from "../types";

const PROGRESS_STORAGE_KEY = "@devbot_progress";
const DAILY_STATS_KEY = "@devbot_daily_stats";

export class ProgressService {
  // Registra uma nova atividade
  static async trackActivity(
    type: "question" | "codeAnalysis" | "templateUsed",
    metadata?: {
      language?: string;
      topic?: string;
      templateId?: string;
    }
  ) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const dailyStats = await this.getDailyStats(today);

      // Atualiza estatísticas do dia
      const updatedStats: DailyStats = {
        ...dailyStats,
        date: today,
        questions:
          type === "question" ? dailyStats.questions + 1 : dailyStats.questions,
        codeAnalyses:
          type === "codeAnalysis"
            ? dailyStats.codeAnalyses + 1
            : dailyStats.codeAnalyses,
        templatesUsed:
          type === "templateUsed"
            ? dailyStats.templatesUsed + 1
            : dailyStats.templatesUsed,
        timeSpent: dailyStats.timeSpent + 1, // aproximação: 1 min por atividade
        languages:
          metadata?.language &&
          !dailyStats.languages.includes(metadata.language)
            ? [...dailyStats.languages, metadata.language]
            : dailyStats.languages,
        topics:
          metadata?.topic && !dailyStats.topics.includes(metadata.topic)
            ? [...dailyStats.topics, metadata.topic]
            : dailyStats.topics,
      };

      await this.saveDailyStats(today, updatedStats);
      await this.updateOverallProgress();
    } catch (error) {
      console.error("Erro ao rastrear atividade:", error);
    }
  }

  // Obtém estatísticas de um dia específico
  static async getDailyStats(date: string): Promise<DailyStats> {
    try {
      const stored = await AsyncStorage.getItem(`${DAILY_STATS_KEY}_${date}`);

      if (stored) {
        return JSON.parse(stored);
      }

      return {
        date,
        questions: 0,
        codeAnalyses: 0,
        templatesUsed: 0,
        timeSpent: 0,
        languages: [],
        topics: [],
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas do dia:", error);
      return {
        date,
        questions: 0,
        codeAnalyses: 0,
        templatesUsed: 0,
        timeSpent: 0,
        languages: [],
        topics: [],
      };
    }
  }

  // Salva estatísticas de um dia
  private static async saveDailyStats(date: string, stats: DailyStats) {
    try {
      await AsyncStorage.setItem(
        `${DAILY_STATS_KEY}_${date}`,
        JSON.stringify(stats)
      );
    } catch (error) {
      console.error("Erro ao salvar estatísticas do dia:", error);
    }
  }

  // Obtém todos os dados de progresso
  static async getProgressData(): Promise<ProgressData> {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        // Atualiza dados em tempo real
        return await this.refreshProgressData(data);
      }

      return await this.initializeProgressData();
    } catch (error) {
      console.error("Erro ao obter dados de progresso:", error);
      return await this.initializeProgressData();
    }
  }

  // Inicializa dados de progresso
  private static async initializeProgressData(): Promise<ProgressData> {
    const initialData: ProgressData = {
      totalQuestions: 0,
      totalCodeAnalyses: 0,
      totalTemplatesUsed: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteLanguages: [],
      favoriteTopics: [],
      dailyStats: [],
      weeklyStats: [],
      monthlyStats: [],
    };

    await AsyncStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(initialData)
    );
    return initialData;
  }

  // Atualiza dados gerais de progresso
  private static async updateOverallProgress() {
    try {
      const progressData = await this.getProgressData();
      const last30Days = await this.getLastNDaysStats(30);

      // Calcula totais
      const totalQuestions = last30Days.reduce(
        (sum, day) => sum + day.questions,
        0
      );
      const totalCodeAnalyses = last30Days.reduce(
        (sum, day) => sum + day.codeAnalyses,
        0
      );
      const totalTemplatesUsed = last30Days.reduce(
        (sum, day) => sum + day.templatesUsed,
        0
      );

      // Calcula streaks
      const { currentStreak, longestStreak } =
        this.calculateStreaks(last30Days);

      // Calcula estatísticas de linguagens
      const favoriteLanguages = this.calculateLanguageStats(last30Days);

      // Calcula estatísticas de tópicos
      const favoriteTopics = this.calculateTopicStats(last30Days);

      // Calcula estatísticas semanais e mensais
      const weeklyStats = this.calculateWeeklyStats(last30Days);
      const monthlyStats = this.calculateMonthlyStats(last30Days);

      const updatedData: ProgressData = {
        ...progressData,
        totalQuestions,
        totalCodeAnalyses,
        totalTemplatesUsed,
        currentStreak,
        longestStreak,
        favoriteLanguages,
        favoriteTopics,
        dailyStats: last30Days,
        weeklyStats,
        monthlyStats,
      };

      await AsyncStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  }

  // Obtém estatísticas dos últimos N dias
  private static async getLastNDaysStats(days: number): Promise<DailyStats[]> {
    const stats: DailyStats[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const dayStats = await this.getDailyStats(dateString);
      stats.unshift(dayStats);
    }

    return stats;
  }

  // Calcula streaks de dias consecutivos
  private static calculateStreaks(dailyStats: DailyStats[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Verifica streak atual (a partir do dia mais recente)
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      const day = dailyStats[i];
      if (day.questions > 0 || day.codeAnalyses > 0 || day.templatesUsed > 0) {
        if (i === dailyStats.length - 1) {
          currentStreak++;
        } else if (currentStreak > 0) {
          currentStreak++;
        }
      } else {
        break;
      }
    }

    // Calcula longest streak
    for (const day of dailyStats) {
      if (day.questions > 0 || day.codeAnalyses > 0 || day.templatesUsed > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  }

  // Calcula estatísticas de linguagens
  private static calculateLanguageStats(
    dailyStats: DailyStats[]
  ): LanguageStats[] {
    const languageCount: { [key: string]: number } = {};
    const languageColors: { [key: string]: string } = {
      JavaScript: "#f7df1e",
      TypeScript: "#3178c6",
      Python: "#3776ab",
      Java: "#ed8b00",
      "C++": "#00599c",
      "C#": "#239120",
      Swift: "#fa7343",
      Kotlin: "#7f52ff",
      Go: "#00add8",
      Rust: "#000000",
      PHP: "#777bb4",
      Ruby: "#cc342d",
      Dart: "#0175c2",
      React: "#61dafb",
      "React Native": "#61dafb",
      Flutter: "#02569b",
      Vue: "#4fc08d",
      Angular: "#dd0031",
    };

    dailyStats.forEach((day) => {
      day.languages.forEach((lang) => {
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });
    });

    const total = Object.values(languageCount).reduce(
      (sum, count) => sum + count,
      0
    );

    return Object.entries(languageCount)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / total) * 100),
        color: languageColors[language] || "#666666",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Calcula estatísticas de tópicos
  private static calculateTopicStats(dailyStats: DailyStats[]): TopicStats[] {
    const topicCount: { [key: string]: number } = {};
    const topicCategories: { [key: string]: TopicStats["category"] } = {
      debug: "debug",
      performance: "codigo",
      algoritmo: "codigo",
      estrutura: "conceito",
      conceito: "conceito",
      revisao: "revisao",
      analise: "revisao",
      explicacao: "conceito",
      exemplo: "geral",
    };

    dailyStats.forEach((day) => {
      day.topics.forEach((topic) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    const total = Object.values(topicCount).reduce(
      (sum, count) => sum + count,
      0
    );

    return Object.entries(topicCount)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / total) * 100),
        category: topicCategories[topic.toLowerCase()] || "geral",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Calcula estatísticas semanais
  private static calculateWeeklyStats(dailyStats: DailyStats[]): WeeklyStats[] {
    const weeklyData: { [key: string]: DailyStats[] } = {};

    dailyStats.forEach((day) => {
      const date = new Date(day.date);
      const year = date.getFullYear();
      const week = this.getWeekNumber(date);
      const weekKey = `${year}-${week.toString().padStart(2, "0")}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(day);
    });

    return Object.entries(weeklyData)
      .map(([week, days]) => {
        const questions = days.reduce((sum, day) => sum + day.questions, 0);
        const averagePerDay = Math.round(questions / days.length);
        const mostActiveDay = days.reduce((max, day) =>
          day.questions > max.questions ? day : max
        ).date;

        return {
          week,
          questions,
          averagePerDay,
          mostActiveDay,
        };
      })
      .slice(-4); // últimas 4 semanas
  }

  // Calcula estatísticas mensais
  private static calculateMonthlyStats(
    dailyStats: DailyStats[]
  ): MonthlyStats[] {
    const monthlyData: { [key: string]: DailyStats[] } = {};

    dailyStats.forEach((day) => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      monthlyData[monthKey].push(day);
    });

    const months = Object.entries(monthlyData)
      .map(([month, days]) => {
        const questions = days.reduce((sum, day) => sum + day.questions, 0);
        const averagePerDay = Math.round(questions / days.length);

        return {
          month,
          questions,
          averagePerDay,
          growth: 0, // será calculado abaixo
        };
      })
      .slice(-3); // últimos 3 meses

    // Calcula crescimento
    months.forEach((month, index) => {
      if (index > 0) {
        const previous = months[index - 1];
        month.growth =
          previous.questions > 0
            ? Math.round(
                ((month.questions - previous.questions) / previous.questions) *
                  100
              )
            : 0;
      }
    });

    return months;
  }

  // Atualiza dados existentes
  private static async refreshProgressData(
    existingData: ProgressData
  ): Promise<ProgressData> {
    const last30Days = await this.getLastNDaysStats(30);

    return {
      ...existingData,
      dailyStats: last30Days,
      weeklyStats: this.calculateWeeklyStats(last30Days),
      monthlyStats: this.calculateMonthlyStats(last30Days),
    };
  }

  // Utilitário: obtém número da semana
  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Limpa dados de progresso (para desenvolvimento/testes)
  static async clearProgressData() {
    try {
      await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);

      // Remove dados dos últimos 30 dias
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        await AsyncStorage.removeItem(`${DAILY_STATS_KEY}_${dateString}`);
      }
    } catch (error) {
      console.error("Erro ao limpar dados de progresso:", error);
    }
  }
}
