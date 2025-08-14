import { GoogleGenerativeAI } from "@google/generative-ai";
import { DevBotConfig, Message } from "../types";
import { getEnvApiKey } from "../utils/env";

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private config: DevBotConfig = {
    maxTokens: 1000,
    temperature: 0.7,
    model: "gemini-2.0-flash",
  };

  constructor() {
    // API Key será configurada dinamicamente
    const envKey = getEnvApiKey();
    if (envKey) {
      this.config.apiKey = envKey;
      this.genAI = new GoogleGenerativeAI(envKey);
    }
  }

  setConfig(config: Partial<DevBotConfig>) {
    this.config = { ...this.config, ...config };
    const apiKey = config.apiKey || getEnvApiKey();
    if (apiKey) {
      this.config.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async sendMessage(message: string, context?: Message[]): Promise<string> {
    // Garante que temos uma API key (do config ou do env)
    const apiKey = this.config.apiKey || getEnvApiKey();
    if (!this.genAI && apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.config.apiKey = apiKey;
    }

    if (!this.genAI || !apiKey) {
      throw new Error(
        "API Key não configurada. Configure nas configurações do app."
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.model });

      // Prepara o contexto da conversa
      let prompt = this.buildPrompt(message, context);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Erro ao chamar API Gemini:", error);
      throw new Error(
        "Erro ao processar sua solicitação. Verifique sua conexão e API Key."
      );
    }
  }

  private buildPrompt(message: string, context?: Message[]): string {
    let prompt = `Você é o DevBot, um assistente especializado em programação para desenvolvedores iniciantes e intermediários.

Suas especialidades:
- Explicar conceitos de programação de forma didática
- Revisar e analisar código
- Sugerir melhorias e boas práticas
- Gerar trechos de código com explicações
- Resolver dúvidas técnicas

Seja sempre:
- Didático e claro nas explicações
- Prático com exemplos de código
- Encorajador e paciente
- Focado em boas práticas

`;

    // Adiciona contexto da conversa se disponível
    if (context && context.length > 0) {
      prompt += "Contexto da conversa anterior:\n";
      context.slice(-5).forEach((msg) => {
        prompt += `${msg.role === "user" ? "Usuário" : "DevBot"}: ${
          msg.content
        }\n`;
      });
      prompt += "\n";
    }

    prompt += `Pergunta atual: ${message}`;

    return prompt;
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const prompt = `Analise este código ${language} e forneça:

1. **Análise Geral**: O que o código faz
2. **Pontos Positivos**: O que está bem implementado
3. **Sugestões de Melhoria**: Como pode ser otimizado
4. **Possíveis Problemas**: Bugs ou vulnerabilidades
5. **Boas Práticas**: Recomendações específicas para ${language}

Código para análise:
\`\`\`${language}
${code}
\`\`\`

Seja específico e didático nas explicações.`;

    return this.sendMessage(prompt);
  }

  async explainConcept(
    concept: string,
    level: "beginner" | "intermediate" = "beginner"
  ): Promise<string> {
    const prompt = `Explique o conceito "${concept}" em programação para um desenvolvedor ${
      level === "beginner" ? "iniciante" : "intermediário"
    }.

Inclua:
- Definição clara e simples
- Quando e por que usar
- Exemplo prático de código
- Dicas importantes
- Erros comuns a evitar

Seja didático e use analogias quando apropriado.`;

    return this.sendMessage(prompt);
  }

  async generateCode(description: string, language: string): Promise<string> {
    const prompt = `Gere código ${language} baseado nesta descrição: "${description}"

Forneça:
1. **Código completo** com comentários explicativos
2. **Explicação** do que cada parte faz
3. **Como usar** o código
4. **Possíveis melhorias** ou variações

Certifique-se de que o código seja:
- Funcional e testado
- Bem comentado
- Seguindo boas práticas de ${language}
- Adequado para desenvolvedores iniciantes/intermediários`;

    return this.sendMessage(prompt);
  }
}

export const geminiService = new GeminiService();
