import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { DailyStats } from "../types";

interface ProgressChartProps {
  data: DailyStats[];
  type: "questions" | "codeAnalyses" | "templatesUsed";
  color: string;
  height?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  type,
  color,
  height = 120,
}) => {
  const chartWidth = screenWidth - 32; // padding
  const maxValue = Math.max(...data.map((d) => d[type]), 1);
  const barWidth = Math.max(
    (chartWidth - (data.length - 1) * 4) / data.length,
    8
  );

  const renderBars = () => {
    return data.map((day, index) => {
      const value = day[type];
      const barHeight = (value / maxValue) * (height - 40);
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });

      return (
        <View key={day.date} style={[styles.barContainer, { width: barWidth }]}>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight || 2,
                  backgroundColor: color,
                  opacity: value > 0 ? 1 : 0.3,
                },
              ]}
            />
          </View>
          <Text style={styles.dayLabel}>{dayName}</Text>
          {value > 0 && (
            <Text style={[styles.valueLabel, { color }]}>{value}</Text>
          )}
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, { height: height + 40 }]}>
      <View style={[styles.chart, { height }]}>{renderBars()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: "center",
  },
  barWrapper: {
    height: "100%",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  bar: {
    borderRadius: 3,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  valueLabel: {
    fontSize: 8,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
});
