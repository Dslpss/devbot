# Dashboard de Progresso - DevBot

## 📊 Visão Geral

O Dashboard de Progresso é uma funcionalidade completa que permite aos usuários acompanhar sua evolução e estatísticas de uso no DevBot. Ele coleta dados automaticamente durante o uso do aplicativo e apresenta insights valiosos sobre hábitos de estudo e progresso.

## ✨ Funcionalidades

### 🔥 Streak de Estudos

- **Sequência Atual**: Número de dias consecutivos com atividade
- **Maior Sequência**: Record pessoal de dias consecutivos
- **Meta Dinâmica**: Meta que se ajusta baseada no histórico do usuário
- **Indicador Diário**: Mostra se hoje já houve atividade

### 📈 Estatísticas Gerais

- **Total de Perguntas**: Contador geral de perguntas feitas
- **Análises de Código**: Número de códigos analisados
- **Templates Usados**: Quantidade de templates utilizados
- **Média Diária**: Cálculos de média por período

### 📊 Gráficos de Atividade

- **Gráfico Semanal**: Visualização da atividade dos últimos 7 dias
- **Gráfico Mensal**: Tendências do mês atual
- **Barras Interativas**: Mostra valores exatos por dia

### 💻 Linguagens Mais Estudadas

- **Gráfico Circular**: Distribuição visual das linguagens
- **Percentuais**: Proporção de uso de cada linguagem
- **Top 5**: Principais linguagens utilizadas
- **Cores Personalizadas**: Cada linguagem tem sua cor característica

### 📚 Tópicos Favoritos

- **Categorização**: Tópicos organizados por categoria
- **Contadores**: Quantidade de vezes que cada tópico foi abordado
- **Percentuais**: Distribuição dos interesses de estudo

### 📊 Tendências

- **Indicadores Visuais**: Setas mostrando crescimento/decrescimento
- **Comparação Semanal**: Comparação com semana anterior
- **Cores Intuitivas**: Verde para crescimento, vermelho para decréscimo

## 🏗️ Arquitetura

### Serviços

#### `ProgressService`

```typescript
// Rastreia atividades automaticamente
ProgressService.trackActivity("question", {
  language: "JavaScript",
  topic: "conceito",
});

// Obtém dados consolidados
const progressData = await ProgressService.getProgressData();
```

#### Funcionalidades:

- ✅ Rastreamento automático de atividades
- ✅ Persistência local com AsyncStorage
- ✅ Cálculo de streaks
- ✅ Estatísticas por período
- ✅ Agregação de dados por linguagem/tópico

### Hooks

#### `useProgress`

```typescript
const {
  progressData,
  loading,
  trackActivity,
  getCurrentWeekStats,
  getTopLanguages,
  hasActivityToday,
} = useProgress();
```

#### Funcionalidades:

- ✅ Estado reativo dos dados de progresso
- ✅ Helpers para cálculos específicos
- ✅ Refresh automático após atividades
- ✅ Tratamento de erro

### Componentes

#### `StatCard`

- Cartões de estatísticas com tendências
- Suporte a ícones e cores personalizadas
- Indicadores visuais de crescimento

#### `StreakCard`

- Cartão especializado para streaks
- Barra de progresso para metas
- Indicador de atividade do dia

#### `ProgressChart`

- Gráfico de barras responsivo
- Dados dos últimos 7-30 dias
- Valores exatos por dia

#### `CircularProgress`

- Gráfico circular para linguagens
- Legenda com percentuais
- Cores personalizadas por linguagem

## 🔧 Integração

### Rastreamento Automático

O sistema rastreia automaticamente atividades em:

#### `ChatScreen`

```typescript
// Pergunta geral
ProgressService.trackActivity("question", {
  topic: "geral",
});

// Análise de código
ProgressService.trackActivity("codeAnalysis", {
  language: "Python",
  topic: "analise",
});
```

#### `TemplatesScreen`

```typescript
// Uso de template
ProgressService.trackActivity("templateUsed", {
  templateId: template.id,
  topic: template.category,
});
```

### Tipos de Dados

#### `DailyStats`

```typescript
interface DailyStats {
  date: string;
  questions: number;
  codeAnalyses: number;
  templatesUsed: number;
  timeSpent: number;
  languages: string[];
  topics: string[];
}
```

#### `ProgressData`

```typescript
interface ProgressData {
  totalQuestions: number;
  currentStreak: number;
  longestStreak: number;
  favoriteLanguages: LanguageStats[];
  favoriteTopics: TopicStats[];
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}
```

## 🚀 Configuração

### 1. Adicionar ao Navegador

```typescript
// AppNavigator.tsx
import { ProgressScreen } from "../screens/ProgressScreen";

<Stack.Screen name="Progress" component={ProgressScreen} />;
```

### 2. Integrar Rastreamento

```typescript
// Em qualquer tela que queira rastrear
import { ProgressService } from "../services/progressService";

// Rastrear atividade
await ProgressService.trackActivity("question", {
  language: "TypeScript",
  topic: "conceito",
});
```

## 🛠️ Desenvolvimento

### Dados de Exemplo

```typescript
// utils/sampleData.ts
import { generateSampleProgressData } from "../utils/sampleData";

// Gera dados dos últimos 14 dias (apenas em desenvolvimento)
await generateSampleProgressData();
```

### Debug

```typescript
// Limpar todos os dados
await ProgressService.clearProgressData();
```

## 📱 Interface

### Tela Principal

- **Header**: Título e subtítulo explicativo
- **Streak Card**: Destaque para sequência atual
- **Estatísticas**: Cards com totais e tendências
- **Gráfico**: Atividade recente visualizada
- **Linguagens**: Gráfico circular das principais linguagens
- **Tópicos**: Lista rankeada de tópicos favoritos
- **Tendências**: Estatísticas semanais/mensais

### Onboarding

- **Modal Explicativo**: Primeira vez que acessa
- **Recursos**: Explicação de cada funcionalidade
- **Dados de Exemplo**: Opção para gerar dados (dev)

## 🎯 Métricas Coletadas

### Automáticas

- ✅ Perguntas feitas ao DevBot
- ✅ Análises de código realizadas
- ✅ Templates utilizados
- ✅ Linguagens de programação detectadas
- ✅ Tópicos de interesse identificados
- ✅ Dias com atividade (para streak)

### Calculadas

- ✅ Streak atual e recorde
- ✅ Médias por período
- ✅ Distribuição de linguagens
- ✅ Ranking de tópicos
- ✅ Tendências de crescimento
- ✅ Metas dinâmicas

## 🔮 Futuras Melhorias

### Planejadas

- [ ] Sincronização em nuvem
- [ ] Comparação com outros usuários
- [ ] Metas personalizáveis
- [ ] Notificações de lembrete
- [ ] Exportar relatórios
- [ ] Gráficos mais avançados (SVG)
- [ ] Achievement system
- [ ] Insights baseados em IA

### Em Consideração

- [ ] Integração com calendário
- [ ] Compartilhamento social
- [ ] Análise de produtividade
- [ ] Recomendações personalizadas

## 📋 Checklist de Implementação

### Concluído ✅

- [x] Estrutura de dados e tipos
- [x] Serviço de rastreamento
- [x] Persistência local
- [x] Hook de gerenciamento
- [x] Componentes de visualização
- [x] Tela principal do dashboard
- [x] Integração com navegação
- [x] Rastreamento automático
- [x] Onboarding explicativo
- [x] Dados de exemplo para desenvolvimento
- [x] Tratamento de erros
- [x] Interface responsiva

### Resultado

Sistema completo e funcional de Dashboard de Progresso integrado ao DevBot, com rastreamento automático, visualizações ricas e insights valiosos para o usuário acompanhar sua evolução nos estudos.
