import { useState, useEffect, useCallback } from "react";
import { ProgressData, DailyStats, LanguageStats, TopicStats } from "../types";
import { ProgressService } from "../services/progressService";

export const useProgress = () => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados de progresso
  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgressService.getProgressData();
      setProgressData(data);
    } catch (err) {
      setError("Erro ao carregar dados de progresso");
      console.error("Erro no useProgress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Registra uma nova atividade
  const trackActivity = useCallback(
    async (
      type: "question" | "codeAnalysis" | "templateUsed",
      metadata?: {
        language?: string;
        topic?: string;
        templateId?: string;
      }
    ) => {
      try {
        await ProgressService.trackActivity(type, metadata);
        // Recarrega dados após registrar atividade
        await loadProgressData();
      } catch (err) {
        console.error("Erro ao registrar atividade:", err);
      }
    },
    [loadProgressData]
  );

  // Obtém estatísticas da semana atual
  const getCurrentWeekStats = useCallback((): DailyStats[] => {
    if (!progressData) return [];

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return progressData.dailyStats.filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= startOfWeek && dayDate <= today;
    });
  }, [progressData]);

  // Obtém estatísticas do mês atual
  const getCurrentMonthStats = useCallback((): DailyStats[] => {
    if (!progressData) return [];

    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM

    return progressData.dailyStats.filter((day) =>
      day.date.startsWith(currentMonth)
    );
  }, [progressData]);

  // Calcula média de perguntas por dia
  const getAverageQuestionsPerDay = useCallback(
    (period: "week" | "month" = "week"): number => {
      const stats =
        period === "week" ? getCurrentWeekStats() : getCurrentMonthStats();
      if (stats.length === 0) return 0;

      const totalQuestions = stats.reduce((sum, day) => sum + day.questions, 0);
      return Math.round(totalQuestions / stats.length);
    },
    [getCurrentWeekStats, getCurrentMonthStats]
  );

  // Obtém top linguagens
  const getTopLanguages = useCallback(
    (limit: number = 5): LanguageStats[] => {
      if (!progressData) return [];
      return progressData.favoriteLanguages.slice(0, limit);
    },
    [progressData]
  );

  // Obtém top tópicos
  const getTopTopics = useCallback(
    (limit: number = 5): TopicStats[] => {
      if (!progressData) return [];
      return progressData.favoriteTopics.slice(0, limit);
    },
    [progressData]
  );

  // Calcula tendência (crescimento/decrescimento)
  const getTrend = useCallback(
    (
      metric: "questions" | "codeAnalyses" | "templatesUsed"
    ): "up" | "down" | "stable" => {
      if (!progressData || progressData.weeklyStats.length < 2) return "stable";

      const currentWeek =
        progressData.weeklyStats[progressData.weeklyStats.length - 1];
      const previousWeek =
        progressData.weeklyStats[progressData.weeklyStats.length - 2];

      const current =
        metric === "questions"
          ? currentWeek.questions
          : metric === "codeAnalyses"
          ? currentWeek.questions // aproximação
          : currentWeek.questions; // aproximação

      const previous =
        metric === "questions"
          ? previousWeek.questions
          : metric === "codeAnalyses"
          ? previousWeek.questions // aproximação
          : previousWeek.questions; // aproximação

      if (current > previous) return "up";
      if (current < previous) return "down";
      return "stable";
    },
    [progressData]
  );

  // Verifica se hoje já teve atividade
  const hasActivityToday = useCallback((): boolean => {
    if (!progressData) return false;

    const today = new Date().toISOString().split("T")[0];
    const todayStats = progressData.dailyStats.find(
      (day) => day.date === today
    );

    return todayStats
      ? todayStats.questions > 0 ||
          todayStats.codeAnalyses > 0 ||
          todayStats.templatesUsed > 0
      : false;
  }, [progressData]);

  // Obtém meta de streak
  const getStreakGoal = useCallback((): number => {
    if (!progressData) return 7;

    // Meta dinâmica baseada no longest streak
    if (progressData.longestStreak < 7) return 7;
    if (progressData.longestStreak < 14) return 14;
    if (progressData.longestStreak < 30) return 30;
    return progressData.longestStreak + 7;
  }, [progressData]);

  // Limpa dados (para desenvolvimento)
  const clearData = useCallback(async () => {
    try {
      await ProgressService.clearProgressData();
      await loadProgressData();
    } catch (err) {
      console.error("Erro ao limpar dados:", err);
    }
  }, [loadProgressData]);

  // Carrega dados ao montar o componente
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  return {
    // Dados
    progressData,
    loading,
    error,

    // Ações
    trackActivity,
    loadProgressData,
    clearData,

    // Helpers
    getCurrentWeekStats,
    getCurrentMonthStats,
    getAverageQuestionsPerDay,
    getTopLanguages,
    getTopTopics,
    getTrend,
    hasActivityToday,
    getStreakGoal,
  };
};
