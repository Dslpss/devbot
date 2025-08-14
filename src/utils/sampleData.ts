import { ProgressService } from "../services/progressService";

/**
 * Função para gerar dados de exemplo para o Dashboard de Progresso
 * Use apenas em desenvolvimento para testar as funcionalidades
 */
export const generateSampleProgressData = async () => {
  try {
    console.log("Gerando dados de exemplo...");

    // Simula atividades dos últimos 14 dias
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simula entre 0-8 perguntas por dia (mais atividade nos últimos dias)
      const questionsCount =
        i < 7
          ? Math.floor(Math.random() * 6) + 1
          : Math.floor(Math.random() * 4);

      for (let j = 0; j < questionsCount; j++) {
        await ProgressService.trackActivity("question", {
          language: getRandomLanguage(),
          topic: getRandomTopic(),
        });
      }

      // Simula análises de código (menos frequentes)
      if (Math.random() > 0.6) {
        await ProgressService.trackActivity("codeAnalysis", {
          language: getRandomLanguage(),
          topic: "analise",
        });
      }

      // Simula uso de templates
      if (Math.random() > 0.4) {
        await ProgressService.trackActivity("templateUsed", {
          templateId: getRandomTemplateId(),
          topic: getRandomTemplateCategory(),
        });
      }
    }

    console.log("Dados de exemplo gerados com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar dados de exemplo:", error);
  }
};

function getRandomLanguage(): string {
  const languages = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "React Native",
    "Swift",
    "Kotlin",
    "C++",
    "Go",
    "Rust",
    "PHP",
  ];
  return languages[Math.floor(Math.random() * languages.length)];
}

function getRandomTopic(): string {
  const topics = [
    "conceito",
    "debug",
    "performance",
    "algoritmo",
    "estrutura",
    "revisao",
    "analise",
    "explicacao",
    "exemplo",
    "geral",
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

function getRandomTemplateId(): string {
  const templateIds = [
    "explain-concept",
    "analyze-code",
    "convert-code",
    "create-example",
    "debug-help",
    "optimize-code",
  ];
  return templateIds[Math.floor(Math.random() * templateIds.length)];
}

function getRandomTemplateCategory(): string {
  const categories = [
    "explanation",
    "analysis",
    "conversion",
    "example",
    "code",
    "custom",
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}
