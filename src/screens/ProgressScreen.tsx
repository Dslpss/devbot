import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProgress } from "../hooks/useProgress";
import { StatCard, StreakCard } from "../components/StatCard";
import { ProgressChart } from "../components/ProgressChart";
import { CircularProgress } from "../components/CircularProgress";
import { ProgressOnboarding } from "../components/ProgressOnboarding";
import { generateSampleProgressData } from "../utils/sampleData";

const { width: screenWidth } = Dimensions.get("window");

export const ProgressScreen: React.FC = () => {
  const {
    progressData,
    loading,
    error,
    loadProgressData,
    clearData,
    getCurrentWeekStats,
    getAverageQuestionsPerDay,
    getTopLanguages,
    getTopTopics,
    getTrend,
    hasActivityToday,
    getStreakGoal,
  } = useProgress();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week"
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Mostra onboarding se não há dados
  useEffect(() => {
    if (!loading && progressData && progressData.totalQuestions === 0) {
      setShowOnboarding(true);
    }
  }, [loading, progressData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const handleClearData = () => {
    Alert.alert(
      "Limpar Dados",
      "Tem certeza que deseja limpar todos os dados de progresso? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: clearData,
        },
      ]
    );
  };

  const handleGenerateSampleData = async () => {
    try {
      await generateSampleProgressData();
      await loadProgressData();
      setShowOnboarding(false);
      Alert.alert("Sucesso!", "Dados de exemplo gerados com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao gerar dados de exemplo");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !progressData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Erro ao carregar dados"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProgressData}
          >
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const weekStats = getCurrentWeekStats();
  const averagePerDay = getAverageQuestionsPerDay(selectedPeriod);
  const topLanguages = getTopLanguages(5);
  const topTopics = getTopTopics(5);
  const streakGoal = getStreakGoal();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard de Progresso</Text>
          <Text style={styles.subtitle}>Acompanhe sua evolução no DevBot</Text>
        </View>

        {/* Streak Card */}
        <StreakCard
          currentStreak={progressData.currentStreak}
          longestStreak={progressData.longestStreak}
          goal={streakGoal}
          hasActivityToday={hasActivityToday()}
        />

        {/* Estatísticas Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Geral</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <StatCard
                title="Total de Perguntas"
                value={progressData.totalQuestions}
                icon="💬"
                color="#007AFF"
                trend={getTrend("questions")}
                subtitle={`${averagePerDay}/dia em média`}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                title="Análises de Código"
                value={progressData.totalCodeAnalyses}
                icon="🔍"
                color="#34C759"
                trend={getTrend("codeAnalyses")}
                subtitle="Último mês"
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                title="Templates Usados"
                value={progressData.totalTemplatesUsed}
                icon="📝"
                color="#FF9500"
                trend={getTrend("templatesUsed")}
                subtitle="Último mês"
              />
            </View>
          </View>
        </View>

        {/* Gráfico de Atividade */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === "week" && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod("week")}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === "week" && styles.periodButtonTextActive,
                  ]}
                >
                  Semana
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === "month" && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod("month")}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === "month" && styles.periodButtonTextActive,
                  ]}
                >
                  Mês
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartCard}>
            <ProgressChart
              data={weekStats}
              type="questions"
              color="#007AFF"
              height={120}
            />
          </View>
        </View>

        {/* Linguagens Favoritas */}
        {topLanguages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linguagens Mais Estudadas</Text>
            <View style={styles.chartCard}>
              <CircularProgress data={topLanguages} />
            </View>
          </View>
        )}

        {/* Tópicos Favoritos */}
        {topTopics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tópicos Favoritos</Text>
            <View style={styles.topicsContainer}>
              {topTopics.map((topic) => (
                <View key={topic.topic} style={styles.topicItem}>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicName}>{topic.topic}</Text>
                    <Text style={styles.topicCategory}>{topic.category}</Text>
                  </View>
                  <View style={styles.topicStats}>
                    <Text style={styles.topicCount}>{topic.count}</Text>
                    <Text style={styles.topicPercentage}>
                      {topic.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Estatísticas Semanais */}
        {progressData.weeklyStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendência Semanal</Text>
            <View style={styles.weeklyContainer}>
              {progressData.weeklyStats.slice(-4).map((week) => (
                <View key={week.week} style={styles.weekItem}>
                  <Text style={styles.weekLabel}>
                    Semana {week.week.split("-")[1]}
                  </Text>
                  <Text style={styles.weekQuestions}>{week.questions}</Text>
                  <Text style={styles.weekAverage}>
                    {week.averagePerDay}/dia
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botões de Debug (apenas em desenvolvimento) */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={handleClearData}
            >
              <Text style={styles.debugButtonText}>Limpar Dados (Debug)</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Onboarding Modal */}
      <ProgressOnboarding
        visible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onGenerateSampleData={__DEV__ ? handleGenerateSampleData : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statsGrid: {
    gap: 8,
  },
  statRow: {
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#007AFF",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  topicsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  topicCategory: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  topicStats: {
    alignItems: "flex-end",
  },
  topicCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  topicPercentage: {
    fontSize: 12,
    color: "#666",
  },
  weeklyContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weekItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  weekQuestions: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 2,
  },
  weekAverage: {
    fontSize: 10,
    color: "#8E8E93",
  },
  debugSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  debugButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});
