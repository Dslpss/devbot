import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProgressOnboardingProps {
  visible: boolean;
  onClose: () => void;
  onGenerateSampleData?: () => void;
}

export const ProgressOnboarding: React.FC<ProgressOnboardingProps> = ({
  visible,
  onClose,
  onGenerateSampleData,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>📊</Text>
          </View>

          <Text style={styles.title}>Dashboard de Progresso</Text>
          <Text style={styles.subtitle}>Acompanhe sua evolução no DevBot</Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔥</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Streak de Estudos</Text>
                <Text style={styles.featureDescription}>
                  Mantenha uma sequência diária de atividades
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📈</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Estatísticas Detalhadas</Text>
                <Text style={styles.featureDescription}>
                  Veja suas perguntas, análises e templates mais usados
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💻</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Linguagens Favoritas</Text>
                <Text style={styles.featureDescription}>
                  Descubra quais tecnologias você mais estuda
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📚</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Tópicos de Interesse</Text>
                <Text style={styles.featureDescription}>
                  Veja os assuntos que você mais explora
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.note}>
            Suas estatísticas começarão a aparecer conforme você usar o DevBot.
            Para ver o dashboard em ação, você pode gerar alguns dados de
            exemplo.
          </Text>

          {__DEV__ && onGenerateSampleData && (
            <TouchableOpacity
              style={styles.sampleButton}
              onPress={onGenerateSampleData}
            >
              <Text style={styles.sampleButtonText}>
                Gerar Dados de Exemplo (Dev)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Entendi!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  mainIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  features: {
    width: "100%",
    marginBottom: 32,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sampleButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  sampleButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
