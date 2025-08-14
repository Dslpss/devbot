import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
  trend?: "up" | "down" | "stable";
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = "#007AFF",
  icon = "📊",
  trend,
  onPress,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#34C759";
      case "down":
        return "#FF3B30";
      case "stable":
        return "#8E8E93";
      default:
        return "#8E8E93";
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, trend && { color: getTrendColor() }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  goal: number;
  hasActivityToday: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  goal,
  hasActivityToday,
}) => {
  const progress = Math.min(currentStreak / goal, 1);
  const progressWidthValue = progress * 100;

  return (
    <View style={[styles.card, styles.streakCard]}>
      <View style={styles.streakHeader}>
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>Sequência Atual</Text>
          <Text style={styles.streakDays}>
            {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
          </Text>
        </View>
        <View
          style={[
            styles.todayIndicator,
            { backgroundColor: hasActivityToday ? "#34C759" : "#FF3B30" },
          ]}
        >
          <Text style={styles.todayText}>{hasActivityToday ? "✓" : "○"}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressWidthValue}%` }]}
          />
        </View>
        <Text style={styles.progressText}>Meta: {goal} dias</Text>
      </View>

      <Text style={styles.longestStreak}>
        Maior sequência: {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  trendContainer: {
    padding: 2,
  },
  trendIcon: {
    fontSize: 16,
  },
  content: {
    alignItems: "flex-start",
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#8E8E93",
  },

  // Streak Card específico
  streakCard: {
    borderLeftColor: "#FF6B35",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  streakDays: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  todayIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  todayText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  longestStreak: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
  },
});
