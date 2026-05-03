<div align="center">

# ⏱️ Cronos Estágio

**Documentação sistemática e reflexiva da jornada docente — transformando cada hora de estágio em um registro de evolução pedagógica.**

[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue?style=flat-square&logo=github)](https://oliveiramannuh.github.io/cronos_estagio/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[🌐 Acesse o App](https://oliveiramannuh.github.io/cronos_estagio/) · [📋 Reportar Bug](https://github.com/OliveiraMannuh/cronos_estagio/issues) · [💡 Sugerir Feature](https://github.com/OliveiraMannuh/cronos_estagio/issues)

</div>

---

## 📖 Sobre o Projeto

**Cronos Estágio** é uma aplicação web voltada para estudantes e estagiários da área de **Letras — Português**, que precisam registrar, acompanhar e refletir sobre suas horas de estágio docente de forma organizada e significativa.

Em vez de planilhas soltas ou cadernos avulsos, o Cronos oferece um ambiente centralizado onde cada entrada vai além do simples registro de horas — ela se torna um diário pedagógico, capturando aprendizados, desafios e evolução ao longo da jornada docente.

### ✨ O Problema que Resolve

Muitos estudantes de licenciatura enfrentam dificuldades para:
- Manter um registro consistente e organizado das horas de estágio
- Refletir criticamente sobre cada experiência em sala de aula
- Gerar relatórios e comprovantes para a instituição de ensino
- Acompanhar o progresso ao longo do semestre

O Cronos Estágio resolve isso com uma interface simples, intuitiva e com suporte de IA para enriquecer as reflexões.

---

## 🚀 Funcionalidades

- **📝 Registro de horas** — Cadastre sessões de estágio com data, duração, escola e turma
- **🤖 Reflexão assistida por IA** — Integração com Gemini (Google GenAI) para auxiliar na construção de reflexões pedagógicas
- **☁️ Sincronização em nuvem** — Dados salvos em tempo real via Firebase Firestore
- **📄 Exportação para DOCX** — Gere relatórios de estágio prontos para entrega à faculdade
- **🔒 Autenticação segura** — Login via Firebase Authentication com regras de acesso por usuário
- **📱 Design responsivo** — Interface adaptada para desktop e mobile com Tailwind CSS
- **🎨 Animações fluidas** — Transições com Framer Motion para melhor experiência do usuário

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript 5.8 |
| Build Tool | Vite 6 |
| Estilização | Tailwind CSS 4 |
| Animações | Framer Motion (motion) |
| Backend/DB | Firebase 12 (Firestore + Auth) |
| IA | Google Generative AI (Gemini) |
| Exportação | docx + file-saver |
| Ícones | Lucide React |
| Deploy | GitHub Pages + GitHub Actions |

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior
- Uma conta no [Firebase](https://firebase.google.com/)
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/) (Gemini)

---

## ⚙️ Instalação e Execução Local

**1. Clone o repositório**

```bash
git clone https://github.com/OliveiraMannuh/cronos_estagio.git
cd cronos_estagio
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure as variáveis de ambiente**

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com os seus dados:

```env
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ **Atenção:** Nunca comite o arquivo `.env.local`. Ele já está no `.gitignore`.

**4. Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

---

## 🔥 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firestore Database** e o **Authentication** (login com e-mail/senha ou Google)
3. Copie as credenciais do Web App para o `.env.local`
4. Aplique as regras de segurança do Firestore:

```bash
# Se tiver o Firebase CLI instalado
firebase deploy --only firestore:rules
```

As regras estão definidas em `firestore.rules` e garantem que cada usuário acesse somente seus próprios dados.

---

## 📜 Scripts Disponíveis

```bash
npm run dev       # Inicia o servidor de desenvolvimento (porta 3000)
npm run build     # Gera o build de produção em /dist
npm run preview   # Pré-visualiza o build de produção localmente
npm run lint      # Verifica erros de tipo com o TypeScript (tsc --noEmit)
npm run clean     # Remove a pasta /dist
```

---

## 🚢 Deploy

O projeto usa **GitHub Actions** para deploy automático no GitHub Pages. A cada push na branch `main`, o workflow de CI/CD executa o build e publica a versão atualizada.

Para configurar o deploy no seu fork:

1. Vá em **Settings → Pages** e selecione a branch `gh-pages` como fonte
2. Adicione os secrets das variáveis de ambiente em **Settings → Secrets and variables → Actions**

---

## 📁 Estrutura do Projeto

```
cronos_estagio/
├── .github/
│   └── workflows/         # CI/CD com GitHub Actions
├── public/                # Assets estáticos
├── src/                   # Código-fonte principal
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Integrações (Firebase, Gemini)
│   └── types/             # Definições de tipos TypeScript
├── .env.example           # Template de variáveis de ambiente
├── firebase-blueprint.json # Configurações de estrutura do Firebase
├── firestore.rules        # Regras de segurança do Firestore
├── vite.config.ts         # Configuração do Vite
└── tsconfig.json          # Configuração do TypeScript
```

---

## 🔐 Segurança

As regras de segurança do Firestore garantem que:
- Usuários só podem ler e escrever seus próprios registros
- Nenhum dado é acessível sem autenticação
- A API Key do Gemini nunca é exposta no client-side em produção

Consulte [`security_spec.md`](./security_spec.md) para a especificação completa do modelo de segurança.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

Por favor, siga o padrão de commits [Conventional Commits](https://www.conventionalcommits.org/).

---

## 👤 Autora

**Mannuh Oliveira**

- GitHub: [@OliveiraMannuh](https://github.com/OliveiraMannuh)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com ❤️ para transformar o estágio docente em uma jornada de crescimento
</div>
