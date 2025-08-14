import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LanguageStats } from "../types";

interface CircularProgressProps {
  data: LanguageStats[];
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  data,
  size = 120,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = 0;

  const renderSegments = () => {
    return data.slice(0, 4).map((item, index) => {
      const percentage = item.percentage;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle += angle;

      const x1 =
        center + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
      const y1 =
        center + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
      const x2 = center + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
      const y2 = center + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      return (
        <View key={item.language} style={styles.segmentContainer}>
          {/* Renderização simplificada com View - em uma implementação real usaria SVG */}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: size, height: size }]}>
        {/* Círculo base */}
        <View
          style={[
            styles.circleBase,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />

        {/* Segmentos coloridos - implementação simplificada */}
        {data.slice(0, 4).map((item, index) => {
          const rotation = index * 90; // distribuição igual para demo
          return (
            <View
              key={item.language}
              style={[
                styles.segment,
                {
                  width: size / 2,
                  height: strokeWidth,
                  backgroundColor: item.color,
                  transform: [
                    { rotate: `${rotation}deg` },
                    { translateX: size / 4 },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        {data.slice(0, 4).map((item) => (
          <View key={item.language} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>{item.language}</Text>
            <Text style={styles.legendPercentage}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  circle: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBase: {
    borderColor: "#f0f0f0",
    position: "absolute",
  },
  segment: {
    position: "absolute",
    borderRadius: 4,
  },
  segmentContainer: {
    position: "absolute",
  },
  legend: {
    marginTop: 16,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  legendPercentage: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
});
