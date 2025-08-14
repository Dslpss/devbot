# DevBot - Assistente de Desenvolvimento Mobile

![DevBot](https://img.shields.io/badge/DevBot-v1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.72-green.svg)
![Expo](https://img.shields.io/badge/Expo-49-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ��� Sobre o Projeto

O **DevBot** é um aplicativo mobile desenvolvido em React Native com Expo, criado para ser o companheiro perfeito de programadores iniciantes e intermediários. Utilizando a poderosa API Gemini da Google, o DevBot oferece:

- **Explicações didáticas** de conceitos de programação
- **Análise inteligente** de código com sugestões de melhoria
- **Geração de código** com exemplos práticos
- **Revisão de código** com foco em boas práticas
- **Interface moderna** e intuitiva

## ��� Tecnologias Utilizadas

- **React Native** com **Expo** - Framework principal
- **TypeScript** - Tipagem estática
- **Google Gemini AI** - Inteligência artificial
- **AsyncStorage** - Persistência local
- **Expo Linear Gradient** - Gradientes visuais
- **Expo Haptics** - Feedback tátil

## ��� Pré-requisitos

Antes de executar o projeto, certifique-se de ter:

- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Expo CLI** instalado globalmente
- **Expo Go** app no seu dispositivo móvel
- **API Key do Google Gemini** ([obtenha aqui](https://makersuite.google.com/app/apikey))

## ���️ Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/devbot.git
cd devbot
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o projeto:**
```bash
npm start
```

4. **Abra no seu dispositivo:**
   - Escaneie o QR code com o app **Expo Go**
   - Ou pressione `a` para abrir no emulador Android
   - Ou pressione `i` para abrir no simulador iOS

## ��� Configuração da API Key

1. **Obtenha sua API Key:**
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma nova API Key
   - Copie a chave gerada

2. **Configure no app:**
   - Abra o DevBot
   - Toque no ícone de configurações
   - Cole sua API Key no campo apropriado
   - Salve as configurações

> ⚠️ **Importante:** Mantenha sua API Key segura e nunca a compartilhe publicamente.

## ��� Estrutura do Projeto

```
devbot/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ChatMessage.tsx  # Componente de mensagem
│   │   └── ChatInput.tsx    # Campo de entrada
│   ├── screens/             # Telas do aplicativo
│   │   └── ChatScreen.tsx   # Tela principal de chat
│   ├── services/            # Serviços e APIs
│   │   ├── geminiService.ts # Integração com Gemini
│   │   └── storageService.ts# Armazenamento local
│   ├── types/               # Definições TypeScript
│   │   └── index.ts         # Tipos principais
│   └── utils/               # Utilitários
│       └── index.ts         # Funções auxiliares
├── App.tsx                  # Componente raiz
├── package.json             # Dependências
└── README.md               # Este arquivo
```

## ��� Funcionalidades Principais

### ��� Chat Inteligente
- Interface de chat moderna e responsiva
- Detecção automática do tipo de mensagem
- Feedback visual com gradientes e ícones
- Feedback háptico para melhor UX

### ��� Análise de Código
- Detecção automática da linguagem de programação
- Análise detalhada com sugestões específicas
- Identificação de problemas e vulnerabilidades
- Recomendações de boas práticas

### ��� Explicações Didáticas
- Explicações claras e acessíveis
- Exemplos práticos de código
- Analogias para facilitar o entendimento
- Níveis de complexidade adaptáveis

### ⚡ Ações Rápidas
- Botões para análise de código
- Templates para diferentes tipos de consulta
- Acesso rápido a funcionalidades comuns

### ��� Persistência Local
- Histórico de conversas salvo localmente
- Configurações personalizáveis
- Backup automático das interações

## ��� Design e UX

O DevBot foi projetado com foco na experiência do usuário:

- **Interface Moderna:** Design clean e profissional
- **Cores Intuitivas:** Esquema de cores que facilita a leitura
- **Feedback Visual:** Gradientes e animações suaves
- **Acessibilidade:** Contraste adequado e navegação intuitiva
- **Responsividade:** Adaptável a diferentes tamanhos de tela

## ��� Segurança e Privacidade

- **API Key Local:** Armazenamento seguro no dispositivo
- **Dados Privados:** Conversas mantidas apenas localmente
- **Sem Tracking:** Nenhum dado é enviado para terceiros
- **Criptografia:** Dados sensíveis protegidos

## ��� Como Usar

### 1. Primeira Configuração
- Abra o app e configure sua API Key
- O DevBot irá validar a chave automaticamente

### 2. Fazendo Perguntas
```
Exemplos de uso:

��� Análise de código:
"Analise este código:
```javascript
function calcular(a, b) {
  return a + b;
}
```"

��� Explicações:
"Explique o conceito de closures em JavaScript"

���️ Geração de código:
"Gere código para ordenar um array em Python"

��� Debugging:
"Ajude-me a debugar este código que não está funcionando"
```

### 3. Recursos Avançados
- **Toque longo** nas mensagens para copiar
- **Ações rápidas** com templates predefinidos
- **Histórico** de conversas acessível
- **Configurações** personalizáveis

## ��� Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ��� Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ���‍��� Autor

Desenvolvido com ❤️ para a comunidade de desenvolvedores.

## ��� Suporte

Encontrou algum problema? Precisa de ajuda?

- Abra uma [issue](https://github.com/seu-usuario/devbot/issues)
- Entre em contato via [email](mailto:seu-email@exemplo.com)

---

**DevBot** - *Seu assistente pessoal de programação* ���✨
