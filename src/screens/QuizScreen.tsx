import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { geminiService } from "../services/geminiService";

interface QuizScreenProps {
  navigation: any;
}

interface QuizTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface QuizLevel {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  questionsCount: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
  difficulty?: string;
}

const topics: QuizTopic[] = [
  {
    id: "js",
    title: "JavaScript",
    icon: "logo-javascript" as any,
    description: "Teste seus conhecimentos em JavaScript, ES6+ e TypeScript",
  },
  {
    id: "react",
    title: "React & React Native",
    icon: "logo-react" as any,
    description: "Perguntas sobre React, hooks, componentes e React Native",
  },
  {
    id: "node",
    title: "Node.js",
    icon: "server" as any,
    description: "Backend com Node.js, Express, APIs e banco de dados",
  },
  {
    id: "python",
    title: "Python",
    icon: "code-slash" as any,
    description: "Python, Django, Flask e ciência de dados",
  },
];

const levels: QuizLevel[] = [
  {
    id: "beginner",
    title: "Iniciante",
    description: "Conceitos básicos e fundamentos",
    icon: "school-outline",
    color: "#34C759",
    questionsCount: 5,
  },
  {
    id: "intermediate",
    title: "Intermediário",
    description: "Conceitos avançados e práticas",
    icon: "library-outline",
    color: "#FF9500",
    questionsCount: 7,
  },
  {
    id: "advanced",
    title: "Avançado",
    description: "Padrões complexos e otimizações",
    icon: "rocket-outline",
    color: "#FF3B30",
    questionsCount: 10,
  },
  {
    id: "expert",
    title: "Expert",
    description: "Desafios para especialistas",
    icon: "trophy-outline",
    color: "#AF52DE",
    questionsCount: 12,
  },
];

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState<"topic" | "level" | "quiz">(
    "topic"
  );
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // Estado para modal customizado
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customTopicText, setCustomTopicText] = useState("");

  const styles = createStyles(theme);

  const generateQuestions = async (topic: QuizTopic, level: QuizLevel) => {
    setLoading(true);
    try {
      const levelDescription = {
        beginner: "nível iniciante - conceitos básicos e fundamentos",
        intermediate: "nível intermediário - conceitos avançados e práticas",
        advanced: "nível avançado - padrões complexos e otimizações",
        expert: "nível expert - desafios para especialistas",
      }[level.id];

      const prompt = `Você é um especialista em ${topic.title}. Gere exatamente ${level.questionsCount} perguntas de múltipla escolha sobre este tema para o ${levelDescription}.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional.

Exemplo do formato JSON correto:
{
  "questions": [
    {
      "text": "Qual das seguintes é uma característica do JavaScript?",
      "options": ["Tipagem estática", "Tipagem dinâmica", "Não tem tipos", "Apenas números"],
      "correctAnswer": 1,
      "hint": "Pense sobre como o JavaScript determina o tipo de uma variável durante a execução do código.",
      "explanation": "JavaScript tem tipagem dinâmica, onde o tipo da variável é determinado em tempo de execução."
    }
  ]
}

Gere ${level.questionsCount} perguntas sobre: ${topic.description}
Nível de dificuldade: ${levelDescription}

Cada pergunta deve ter:
- text: pergunta clara sobre ${topic.title}
- options: 4 opções válidas
- correctAnswer: índice da resposta correta (0, 1, 2 ou 3)
- hint: dica lógica sutil que ajude o raciocínio sem dar a resposta direta
- explanation: explicação detalhada

Para o nível ${level.title}:
${level.description}`;

      console.log("🚀 Gerando perguntas para:", topic.title);
      const response = await geminiService.sendMessage(prompt, []);
      console.log("📝 Resposta bruta da API:", response);

      // Limpa a resposta removendo markdown e espaços
      let cleanResponse = response.trim();

      // Remove code blocks se existirem
      cleanResponse = cleanResponse
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "");
      cleanResponse = cleanResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");

      console.log("🧹 Resposta limpa:", cleanResponse);

      let jsonData;
      try {
        jsonData = JSON.parse(cleanResponse);
        console.log("✅ JSON parseado com sucesso:", jsonData);
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON:", parseError);
        console.log("📄 Tentando extrair JSON da resposta...");

        // Tenta encontrar JSON na resposta
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0]);
            console.log("✅ JSON extraído com sucesso:", jsonData);
          } catch (secondParseError) {
            throw new Error(
              `Não foi possível parsear a resposta como JSON. Resposta: ${cleanResponse.substring(
                0,
                200
              )}...`
            );
          }
        } else {
          throw new Error(
            `Resposta não contém JSON válido. Resposta: ${cleanResponse.substring(
              0,
              200
            )}...`
          );
        }
      }

      if (
        !jsonData ||
        !jsonData.questions ||
        !Array.isArray(jsonData.questions) ||
        jsonData.questions.length === 0
      ) {
        throw new Error(
          `Formato de resposta inválido. Esperado objeto com array 'questions'. Recebido: ${JSON.stringify(
            jsonData
          )}`
        );
      }

      // Valida cada pergunta
      for (let i = 0; i < jsonData.questions.length; i++) {
        const q = jsonData.questions[i];
        if (
          !q.text ||
          !q.options ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== "number" ||
          q.correctAnswer < 0 ||
          q.correctAnswer > 3 ||
          !q.explanation
        ) {
          throw new Error(
            `Pergunta ${i + 1} tem formato inválido: ${JSON.stringify(q)}`
          );
        }
      }

      // Adiciona IDs únicos
      const questionsWithIds = jsonData.questions.map(
        (q: any, index: number) => ({
          ...q,
          id: `${topic.id}_${index}_${Date.now()}`,
        })
      );

      console.log("🎯 Perguntas finais:", questionsWithIds);

      setQuestions(questionsWithIds);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSelectedTopic(topic);
      setCurrentStep("quiz");
    } catch (error: any) {
      console.error("💥 Erro detalhado:", error);
      Alert.alert(
        "Erro na Geração",
        `Detalhes: ${error.message}\n\nTente usar o botão de teste da API primeiro para verificar a conexão.`,
        [{ text: "OK" }, { text: "Testar API", onPress: () => testAPI() }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Funções de navegação entre etapas
  const handleTopicSelect = (topic: QuizTopic) => {
    setSelectedTopic(topic);
    setCurrentStep("level");
  };

  const handleLevelSelect = (level: QuizLevel) => {
    setSelectedLevel(level);
    generateQuestions(selectedTopic!, level);
  };

  const handleBackToTopics = () => {
    setCurrentStep("topic");
    setSelectedTopic(null);
    setSelectedLevel(null);
  };

  const handleBackToLevels = () => {
    setCurrentStep("level");
    setQuestions([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowHint(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  const handleCustomTopicQuiz = (customTopic: QuizTopic) => {
    // Para tópicos customizados, também passa pela seleção de nível
    setSelectedTopic(customTopic);
    setCurrentStep("level");
  };

  // Renderizar seleção de nível
  const renderLevelSelection = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToTopics}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{selectedTopic?.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Selecione o Nível</Text>
        <Text style={styles.sectionSubtitle}>
          Escolha a dificuldade do seu quiz sobre {selectedTopic?.title}
        </Text>

        {levels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[styles.levelItem, { borderLeftColor: level.color }]}
            onPress={() => handleLevelSelect(level)}
          >
            <View style={styles.levelIcon}>
              <Ionicons
                name={level.icon as any}
                size={24}
                color={level.color}
              />
            </View>
            <View style={styles.levelContent}>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
              <Text style={styles.levelQuestions}>
                {level.questionsCount} perguntas
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  const testAPI = async () => {
    try {
      const testResponse = await geminiService.sendMessage(
        "Responda apenas: 'API funcionando'",
        []
      );
      Alert.alert(
        "✅ API OK",
        `Resposta: ${testResponse.substring(0, 100)}...`
      );
    } catch (error: any) {
      Alert.alert("❌ API Error", `Erro: ${error?.message || error}`);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (
      questions[currentQuestion] &&
      answerIndex === questions[currentQuestion].correctAnswer
    ) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowHint(false);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setQuestions([]);
    setSelectedTopic(null);
    setSelectedLevel(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowHint(false);
    setCurrentStep("topic");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Gerando perguntas...</Text>
      </View>
    );
  }

  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons
            name={score > questions.length / 2 ? "trophy" : "school"}
            size={80}
            color={theme.primary}
          />
          <Text style={styles.resultTitle}>Quiz Finalizado!</Text>
          <Text style={styles.resultScore}>
            Pontuação: {score} de {questions.length}
          </Text>
          <TouchableOpacity style={styles.button} onPress={restartQuiz}>
            <Text style={styles.buttonText}>Novo Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Navegação por etapas
  if (currentStep === "level") {
    return renderLevelSelection();
  }

  if (currentStep === "topic") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Quiz de Programação</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.subtitle}>Escolha um tema:</Text>

          {/* Botão de teste da API */}
          <TouchableOpacity style={styles.testButton} onPress={testAPI}>
            <Text style={styles.testButtonText}>🔧 Testar API</Text>
          </TouchableOpacity>

          {/* Botão de teste do modal */}
          {/* Botão para tema customizado */}
          <TouchableOpacity
            style={styles.customTopicButton}
            onPress={() => setCustomModalVisible(true)}
          >
            <View style={styles.topicIcon}>
              <Ionicons name="create" size={24} color={theme.primary} />
            </View>
            <View style={styles.topicInfo}>
              <Text style={styles.customTopicTitle}>Tema Personalizado</Text>
              <Text style={styles.topicDescription}>
                Crie um quiz sobre qualquer tema de programação
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {/* Modal customizado para digitar tema */}
          <Modal
            visible={customModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setCustomModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 24,
                  width: "85%",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
                >
                  Tema Personalizado
                </Text>
                <Text style={{ marginBottom: 12 }}>
                  Digite um tema de programação para o quiz:
                </Text>
                <TextInput
                  value={customTopicText}
                  onChangeText={setCustomTopicText}
                  placeholder="Ex: Algoritmos em Python"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 16,
                  }}
                  autoFocus
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setCustomModalVisible(false);
                      setCustomTopicText("");
                    }}
                    style={{ marginRight: 16 }}
                  >
                    <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (customTopicText.trim()) {
                        const customTopicObj = {
                          id: "custom",
                          title: customTopicText.trim(),
                          icon: "create" as any,
                          description: `Quiz personalizado sobre ${customTopicText.trim()}`,
                        };
                        setCustomModalVisible(false);
                        setCustomTopicText("");
                        handleCustomTopicQuiz(customTopicObj);
                      } else {
                        // Pode mostrar um alerta ou feedback visual
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Criar Quiz
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicItem}
              onPress={() => handleTopicSelect(topic)}
            >
              <View style={styles.topicIcon}>
                <Ionicons
                  name={topic.icon as any}
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Verificação de segurança antes de renderizar o quiz
  if (
    currentStep === "quiz" &&
    (!questions.length || currentQuestion >= questions.length)
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Erro: Pergunta não encontrada</Text>
          <TouchableOpacity style={styles.button} onPress={restartQuiz}>
            <Text style={styles.buttonText}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLevels}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{selectedTopic?.title || "Quiz"}</Text>
          <Text style={styles.levelBadge}>
            {selectedLevel?.title || "Nível"} • {questions.length} perguntas
          </Text>
        </View>
        <Text style={styles.progress}>
          {currentQuestion + 1}/{questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questions[currentQuestion]?.text || "Carregando pergunta..."}
          </Text>

          {/* Botão de Dica */}
          {questions[currentQuestion]?.hint && selectedAnswer === null && (
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowHint(!showHint)}
            >
              <Ionicons
                name="bulb-outline"
                size={16}
                color={theme.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.hintButtonText, { color: theme.primary }]}>
                {showHint ? "Ocultar Dica" : "Ver Dica"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Dica */}
          {showHint && questions[currentQuestion]?.hint && (
            <View
              style={[
                styles.hintContainer,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Ionicons
                name="bulb"
                size={18}
                color={theme.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.hintText, { color: theme.primary }]}>
                {questions[currentQuestion]?.hint}
              </Text>
            </View>
          )}

          <View style={styles.options}>
            {questions[currentQuestion]?.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  selectedAnswer !== null && {
                    backgroundColor:
                      index === questions[currentQuestion]?.correctAnswer
                        ? theme.success + "20"
                        : index === selectedAnswer
                        ? theme.error + "20"
                        : theme.card,
                  },
                ]}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer !== null && {
                      color:
                        index === questions[currentQuestion]?.correctAnswer
                          ? theme.success
                          : index === selectedAnswer
                          ? theme.error
                          : theme.text,
                    },
                  ]}
                >
                  {option}
                </Text>
                {selectedAnswer !== null &&
                  index === questions[currentQuestion]?.correctAnswer && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.success}
                    />
                  )}
                {selectedAnswer === index &&
                  index !== questions[currentQuestion]?.correctAnswer && (
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={theme.error}
                    />
                  )}
              </TouchableOpacity>
            ))}
          </View>

          {showExplanation && (
            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>Explicação:</Text>
              <Text style={styles.explanationText}>
                {questions[currentQuestion]?.explanation ||
                  "Explicação não disponível."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedAnswer !== null && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={nextQuestion}>
            <Text style={styles.buttonText}>
              {currentQuestion + 1 < questions.length
                ? "Próxima Pergunta"
                : "Ver Resultado"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
    },
    progress: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      margin: 16,
    },
    topicItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
    },
    topicIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    topicInfo: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    questionCard: {
      backgroundColor: theme.card,
      margin: 16,
      padding: 16,
      borderRadius: 12,
    },
    questionText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 16,
    },
    hintButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
      marginBottom: 12,
    },
    hintButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    hintContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    hintText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
      fontStyle: "italic",
      lineHeight: 20,
    },
    options: {
      marginTop: 16,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    explanation: {
      marginTop: 24,
      padding: 16,
      backgroundColor: theme.primaryLight,
      borderRadius: 8,
    },
    explanationTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    explanationText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    buttonContainer: {
      padding: 16,
      paddingTop: 8,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
    },
    resultContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    resultScore: {
      fontSize: 18,
      color: theme.textSecondary,
      marginBottom: 32,
    },
    testButton: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      alignItems: "center",
    },
    testButtonText: {
      color: theme.white,
      fontSize: 14,
      fontWeight: "500",
    },
    customTopicButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.primary,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    customTopicTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 400,
      maxHeight: "80%",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      flex: 1,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginBottom: 8,
      marginTop: 12,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    modalInputMultiline: {
      height: 80,
      textAlignVertical: "top",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 12,
    },
    modalCancelButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    modalCancelText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    modalCreateButton: {
      flex: 1,
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    modalCreateButtonDisabled: {
      backgroundColor: theme.textSecondary,
    },
    modalCreateText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
    },

    // Estilos para seleção de nível
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 8,
      marginTop: 16,
    },
    sectionSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    levelItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      margin: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
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
    levelIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#f5f5f5",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    levelContent: {
      flex: 1,
    },
    levelTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    levelDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    levelQuestions: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "500",
    },

    // Estilos para header do quiz
    headerContent: {
      flex: 1,
      alignItems: "center",
    },
    levelBadge: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
      marginTop: 2,
    },
  });

export default QuizScreen;
