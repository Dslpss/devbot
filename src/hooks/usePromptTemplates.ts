import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { PromptTemplate } from "../types";
import { storageService } from "../services/storageService";

// Templates predefinidos
const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: "explain-concept",
    title: "Explique este conceito",
    description: "Peça explicação detalhada sobre um conceito de programação",
    template:
      "Explique o conceito de {concept} em {language}. Inclua:\n- Definição clara\n- Exemplo prático\n- Casos de uso\n- Melhores práticas",
    category: "explanation",
    isCustom: false,
    variables: ["concept", "language"],
    createdAt: new Date(),
    usageCount: 0,
  },
  {
    id: "analyze-performance",
    title: "Analise performance deste código",
    description: "Análise detalhada de performance e otimização",
    template:
      "Analise a performance deste código {language}:\n\n{code}\n\nFornecça:\n- Pontos de otimização\n- Complexidade algorítmica\n- Sugestões de melhoria\n- Código otimizado",
    category: "analysis",
    isCustom: false,
    variables: ["language", "code"],
    createdAt: new Date(),
    usageCount: 0,
  },
  {
    id: "convert-language",
    title: "Converta de X para Y",
    description: "Converta código de uma linguagem para outra",
    template:
      "Converta este código de {fromLanguage} para {toLanguage}:\n\n{code}\n\nMantenha:\n- Mesma funcionalidade\n- Boas práticas da linguagem destino\n- Comentários explicativos\n- Tratamento de erros",
    category: "conversion",
    isCustom: false,
    variables: ["fromLanguage", "toLanguage", "code"],
    createdAt: new Date(),
    usageCount: 0,
  },
  {
    id: "create-example",
    title: "Crie exemplo prático de...",
    description: "Gere exemplos práticos e funcionais",
    template:
      "Crie um exemplo prático de {topic} em {language}:\n\n- Código completo e funcional\n- Comentários explicativos\n- Exemplo de uso\n- Possíveis extensões",
    category: "example",
    isCustom: false,
    variables: ["topic", "language"],
    createdAt: new Date(),
    usageCount: 0,
  },
  {
    id: "code-review",
    title: "Revisão de código",
    description: "Revisão completa com foco em qualidade",
    template:
      "Faça uma revisão detalhada deste código {language}:\n\n{code}\n\nAvalie:\n- Legibilidade e organização\n- Boas práticas\n- Possíveis bugs\n- Sugestões de melhoria\n- Padrões de design",
    category: "analysis",
    isCustom: false,
    variables: ["language", "code"],
    createdAt: new Date(),
    usageCount: 0,
  },
  {
    id: "debug-help",
    title: "Ajuda com debugging",
    description: "Identificar e resolver problemas no código",
    template:
      "Ajude-me a debugar este problema em {language}:\n\n{code}\n\nErro/Problema: {error}\n\nPreciso de:\n- Identificação da causa\n- Solução paso a paso\n- Código corrigido\n- Como evitar no futuro",
    category: "analysis",
    isCustom: false,
    variables: ["language", "code", "error"],
    createdAt: new Date(),
    usageCount: 0,
  },
];

const STORAGE_KEYS = {
  TEMPLATES: "prompt_templates",
  USAGE_STATS: "template_usage_stats",
};

export const usePromptTemplates = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar templates do storage
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await storageService.getData<PromptTemplate[]>(
        STORAGE_KEYS.TEMPLATES
      );

      if (stored && Array.isArray(stored) && stored.length > 0) {
        // Merge templates padrão com customizados, removendo duplicatas
        const customTemplates = stored.filter(
          (t: PromptTemplate) => t.isCustom
        );
        const defaultWithUpdatedUsage = DEFAULT_TEMPLATES.map(
          (defaultTemplate) => {
            const storedTemplate = stored.find(
              (t: PromptTemplate) => t.id === defaultTemplate.id
            );
            return storedTemplate
              ? { ...defaultTemplate, usageCount: storedTemplate.usageCount }
              : defaultTemplate;
          }
        );

        setTemplates([...defaultWithUpdatedUsage, ...customTemplates]);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
        await storageService.saveData(
          STORAGE_KEYS.TEMPLATES,
          DEFAULT_TEMPLATES
        );
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar templates
  const saveTemplates = useCallback(async (newTemplates: PromptTemplate[]) => {
    try {
      await storageService.saveData(STORAGE_KEYS.TEMPLATES, newTemplates);
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Erro ao salvar templates:", error);
      Alert.alert("Erro", "Não foi possível salvar os templates");
    }
  }, []);

  // Criar novo template customizado
  const createTemplate = useCallback(
    async (
      templateData: Omit<
        PromptTemplate,
        "id" | "createdAt" | "isCustom" | "usageCount"
      >
    ) => {
      const newTemplate: PromptTemplate = {
        ...templateData,
        id: `custom_${Date.now()}`,
        isCustom: true,
        createdAt: new Date(),
        usageCount: 0,
      };

      const updatedTemplates = [...templates, newTemplate];
      await saveTemplates(updatedTemplates);
      return newTemplate;
    },
    [templates, saveTemplates]
  );

  // Editar template customizado
  const editTemplate = useCallback(
    async (templateId: string, updates: Partial<PromptTemplate>) => {
      const templateIndex = templates.findIndex((t) => t.id === templateId);
      if (templateIndex === -1) return false;

      const template = templates[templateIndex];
      if (!template.isCustom) {
        Alert.alert("Erro", "Não é possível editar templates predefinidos");
        return false;
      }

      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date(),
      };

      const updatedTemplates = [...templates];
      updatedTemplates[templateIndex] = updatedTemplate;
      await saveTemplates(updatedTemplates);
      return true;
    },
    [templates, saveTemplates]
  );

  // Excluir template customizado
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template?.isCustom) {
        Alert.alert("Erro", "Não é possível excluir templates predefinidos");
        return false;
      }

      const updatedTemplates = templates.filter((t) => t.id !== templateId);
      await saveTemplates(updatedTemplates);
      return true;
    },
    [templates, saveTemplates]
  );

  // Incrementar contador de uso
  const incrementUsage = useCallback(
    async (templateId: string) => {
      const templateIndex = templates.findIndex((t) => t.id === templateId);
      if (templateIndex === -1) return;

      const updatedTemplates = [...templates];
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        usageCount: updatedTemplates[templateIndex].usageCount + 1,
      };

      await saveTemplates(updatedTemplates);
    },
    [templates, saveTemplates]
  );

  // Aplicar template com variáveis
  const applyTemplate = useCallback(
    (template: PromptTemplate, variables: Record<string, string> = {}) => {
      let appliedTemplate = template.template;

      // Substituir variáveis no template
      if (template.variables) {
        template.variables.forEach((variable) => {
          const value = variables[variable] || `{${variable}}`;
          appliedTemplate = appliedTemplate.replace(
            new RegExp(`{${variable}}`, "g"),
            value
          );
        });
      }

      // Incrementar contador de uso
      incrementUsage(template.id);

      return appliedTemplate;
    },
    [incrementUsage]
  );

  // Duplicar template (criar custom baseado em predefinido)
  const duplicateTemplate = useCallback(
    async (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return null;

      const duplicatedTemplate = await createTemplate({
        title: `${template.title} (Cópia)`,
        description: template.description,
        template: template.template,
        category: template.category,
        variables: template.variables,
      });

      return duplicatedTemplate;
    },
    [templates, createTemplate]
  );

  // Filtrar templates por categoria
  const filterByCategory = useCallback(
    (category: PromptTemplate["category"] | "all") => {
      if (category === "all") return templates;
      return templates.filter((t) => t.category === category);
    },
    [templates]
  );

  // Buscar templates
  const searchTemplates = useCallback(
    (query: string) => {
      if (!query.trim()) return templates;

      const searchTerm = query.toLowerCase();
      return templates.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm) ||
          t.description.toLowerCase().includes(searchTerm) ||
          t.template.toLowerCase().includes(searchTerm)
      );
    },
    [templates]
  );

  // Templates mais usados
  const getMostUsedTemplates = useCallback(
    (limit: number = 5) => {
      return [...templates]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    },
    [templates]
  );

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    createTemplate,
    editTemplate,
    deleteTemplate,
    applyTemplate,
    duplicateTemplate,
    filterByCategory,
    searchTemplates,
    getMostUsedTemplates,
    incrementUsage,
    reloadTemplates: loadTemplates,
  };
};
