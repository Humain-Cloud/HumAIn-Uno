<div align="center">

# 🤖 Humain-Uno

### AI Agent Marketplace — Discover, Build & Share Intelligent Agents

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

</div>

---

**Humain-Uno** is a full-featured, production-grade AI Agent Marketplace that empowers developers and organizations to discover, compare, build, and share AI agents across the most popular frameworks. Browse **800+ curated agents** spanning LangGraph, CrewAI, AutoGen, Agno, and LlamaIndex, or create your own with our AI-assisted agent wizard.

Explore **90+ LLM models** from the Arena.ai leaderboard with real-time scoring, tier rankings, and intelligent use-case recommendations — all in one unified platform.

---

## ✨ Key Features

### 🔍 Discovery & Exploration
- **Knowledge Hub** — Browse and search 800+ curated AI agent projects with advanced filtering by framework, industry, category, and difficulty level
- **LLM Model Finder** — Explore 90+ LLM models synced from Arena.ai with Arena ELO scores, tier rankings (S/A/B/C/D), pricing, context windows, and capability matrices
- **Smart Search** — Full-text search with real-time suggestions, popular queries, and cross-source results (agents, knowledge base, LLM models)
- **Use-Case Recommender** — Describe your use case and get intelligent model recommendations ranked by relevance

### 🤖 Agent Creation & Management
- **Agent Creation Wizard** — 8-step guided wizard: Info → Source → Template → Config → AI-Assisted → Knowledge → Code → Review
- **AI Code Generation** — Generate agent specifications, prompt templates, and full code bundles with AI assistance
- **Fork & Customize** — Fork any agent into your own copy with full lineage tracking
- **Version Control** — Every agent tracks version history with incremental updates

### 📊 Comparison & Analysis
- **Side-by-Side Compare** — Compare up to 4 agents or LLM models simultaneously across all KPIs
- **Detailed Metrics** — Arena scores, tier classifications, context windows, pricing, parameters, open-source status, and capability flags
- **Framework Showcase** — Visual breakdown of LangGraph, CrewAI, AutoGen, Agno, and LlamaIndex capabilities

### 👥 Social & Community
- **Star & Rate** — Star agents, leave 1–5 star ratings with written reviews
- **Threaded Comments** — Discuss agents with nested, threaded comment replies
- **Bookmarks & Collections** — Save agents for later; organize them into public or private collections
- **Activity Feed** — Track platform activity: new agents, comments, stars, forks

### 🔐 Authentication & Security
- **Supabase Auth** — Secure sign-up/sign-in with email, OAuth providers, and magic links
- **NextAuth.js v4** — Server-side session management with SSR session refresh
- **API Keys** — Generate scoped API keys with granular permissions (read, write, admin)
- **Row-Level Security** — Supabase RLS policies protect all data at the database level

### 📈 Analytics & Admin
- **Platform Dashboard** — Real-time stats: total users, agents, stars, forks, views, downloads, API calls
- **Search Analytics** — Track and analyze popular search queries across all sources
- **Admin Panel** — Feature agents, view activity logs, reindex knowledge base
- **LLM Sync Engine** — Automated sync from Arena.ai leaderboard with changelog tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Humain-Uno Frontend                   │
│  Next.js 16 (App Router) · React 19 · shadcn/ui        │
│  Tailwind CSS 4 · Framer Motion · Zustand               │
│  TanStack Query · TanStack Table · Recharts              │
├─────────────────────────────────────────────────────────┤
│                     API Layer                            │
│  Next.js API Routes · z-ai-web-dev-sdk (AI)             │
│  Supabase Auth · NextAuth.js v4                         │
├──────────────────────┬──────────────────────────────────┤
│   SQLite (Dev)       │   Supabase PostgreSQL (Prod)     │
│   Prisma ORM         │   RLS · Triggers · GIN Indexes   │
└──────────────────────┴──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | 16 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5 |
| **Runtime** | [Bun](https://bun.sh/) | Latest |
| **UI Library** | [shadcn/ui](https://ui.shadcn.com/) (New York) | 40+ components |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4 |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | 12 |
| **Database (Dev)** | [Prisma](https://www.prisma.io/) + SQLite | 6 |
| **Database (Prod)** | [Supabase](https://supabase.com/) PostgreSQL | Latest |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) + Supabase Auth | v4 |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | 5 |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) | 5 |
| **Tables** | [TanStack Table](https://tanstack.com/table) | 8 |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Latest |
| **Charts** | [Recharts](https://recharts.org/) | 2 |
| **AI SDK** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) | Latest |
| **Icons** | [Lucide React](https://lucide.dev/) | Latest |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) + MDX Editor | Latest |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) | Latest |

---

## 📦 Database Schema

Humain-Uno uses **20+ Prisma models** organized into the following domains:

| Domain | Models | Description |
|---|---|---|
| **Auth** | `Account`, `Session`, `VerificationToken` | NextAuth.js core models |
| **Core** | `User`, `Agent`, `Category`, `Industry`, `KnowledgeAgent` | Primary business entities |
| **Social** | `Star`, `Rating`, `Comment`, `Bookmark` | Engagement and social features |
| **Collections** | `Collection`, `CollectionItem` | User-curated agent collections |
| **Notifications** | `Notification` | In-app notification center |
| **AI Chat** | `ChatSession`, `ChatMessage` | AI assistant conversations |
| **Analytics** | `ActivityLog`, `PlatformStat`, `SearchQuery` | Platform analytics and tracking |
| **API** | `ApiKey` | Scoped API key management |
| **LLM Finder** | `LLMModel`, `LLMModelSyncLog` | Arena.ai model sync and tracking |

**Production Schema (Supabase):** The full production deployment uses a 21-table PostgreSQL schema with Row-Level Security (RLS), GIN full-text indexes, counter-maintenance triggers, and automated sync procedures. See [`supabase-migration-full.sql`](./supabase-migration-full.sql) for the complete migration.

---

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** >= 1.0 (recommended runtime)
- **Node.js** >= 20 (alternative)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Humain-Cloud/HumAIn-Uno.git
cd HumAIn-Uno

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and other credentials
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example` for the full template):

```env
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional: AI Features
Z_AI_API_KEY=your-z-ai-api-key
```

### Database Setup

```bash
# Push the Prisma schema to SQLite (development)
bun run db:push

# Generate the Prisma client
bun run db:generate
```

### Running the Development Server

```bash
# Start the dev server on port 3000
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Seeding Data

```bash
# Seed the LLM model database with 90+ models from Arena.ai
curl -X POST http://localhost:3000/api/llm-models/seed

# Sync LLM models from Arena.ai leaderboard
curl -X POST http://localhost:3000/api/llm-models/sync

# Run custom seed scripts
bun run scripts/seed-agents.ts
bun run scripts/seed-knowledge.ts
```

---

## 📂 Project Structure

```
HumAIn-Uno/
├── .github/                    # GitHub community files
│   ├── ISSUE_TEMPLATE/         # Bug report & feature request templates
│   └── pull_request_template.md
├── prisma/
│   ├── schema.prisma           # Database schema (20+ models)
│   └── dev.db                  # SQLite database (dev)
├── supabase/
│   └── migrations/             # Supabase SQL migrations
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── browse/             # Agent browsing
│   │   ├── agents/[id]/        # Agent detail
│   │   ├── dashboard/          # User dashboard
│   │   ├── create/             # Agent creation wizard
│   │   ├── llm-finder/         # LLM model finder
│   │   ├── knowledge-base/     # Knowledge hub
│   │   ├── settings/           # User settings
│   │   ├── auth/               # Authentication pages
│   │   └── api/                # API routes (20+ endpoints)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (40+)
│   │   ├── views/              # Page-level view components
│   │   ├── layout/             # Navbar, Footer, DynamicLayout
│   │   ├── home/               # Home page sections
│   │   ├── browse/             # Browse page components
│   │   ├── detail/             # Agent detail components
│   │   ├── llm-finder/         # LLM model finder components
│   │   ├── wizard/             # Agent creation wizard steps
│   │   ├── ai/                 # AI chat panel
│   │   └── shared/             # Shared UI components
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── store.ts            # Zustand global store
│   │   ├── api-client.ts       # Typed API client
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   ├── utils.ts            # Utility functions
│   │   └── supabase/           # Supabase client configs
│   ├── hooks/                  # Custom React hooks
│   └── middleware.ts           # Auth session refresh middleware
├── knowledge-base/             # Curated 500 AI agents reference
├── scripts/                    # Seed & utility scripts
├── public/                     # Static assets
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE
```

---

## 🧪 Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the development server on port 3000 |
| `bun run build` | Build the production application |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint to check code quality |
| `bun run db:push` | Push Prisma schema to the database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:reset` | Reset the database |

---

## 🌐 API Overview

Humain-Uno provides **20+ API endpoints** organized by domain:

| Endpoint | Methods | Description |
|---|---|---|
| `/api/agents` | GET, POST | List/create agents |
| `/api/agents/[id]` | GET, PATCH, DELETE | Agent CRUD |
| `/api/agents/[id]/star` | POST, DELETE | Star/unstar agent |
| `/api/agents/[id]/fork` | POST | Fork an agent |
| `/api/agents/[id]/comments` | GET, POST | Agent comments |
| `/api/knowledge` | GET | Search knowledge base |
| `/api/knowledge/compare` | POST | Compare agents |
| `/api/llm-models` | GET | List LLM models |
| `/api/llm-models/[id]` | GET | Model details |
| `/api/llm-models/sync` | POST | Sync from Arena.ai |
| `/api/llm-models/seed` | POST | Seed model data |
| `/api/llm-models/recommend` | GET | Use-case recommendations |
| `/api/ai/chat` | POST | AI chat completions |
| `/api/ai/suggest` | GET | AI agent suggestions |
| `/api/ai/generate-spec` | POST | Generate agent spec |
| `/api/ai/generate-code` | POST | Generate agent code |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth endpoints |
| `/api/bookmarks` | GET, POST, DELETE | Bookmark management |
| `/api/collections` | GET, POST | Collection CRUD |
| `/api/notifications` | GET, PATCH | Notification management |
| `/api/stats` | GET | Platform analytics |
| `/api/admin/*` | GET, POST | Admin-only operations |

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, improving documentation, or suggesting enhancements — your help makes Humain-Uno better for everyone.

Please read our **[Contributing Guidelines](./CONTRIBUTING.md)** to get started, and don't forget to follow our **[Code of Conduct](./CODE_OF_CONDUCT.md)**.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines including commit conventions, PR requirements, and code review process.

---

## 🛡️ Security

We take security seriously. If you discover a vulnerability, please follow our responsible disclosure process outlined in our **[Security Policy](./SECURITY.md)**.

**Do not** report security vulnerabilities through public GitHub issues. Instead, please report them privately as described in the security policy.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Humain-Uno Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **[Arena.ai](https://arena.ai/)** — LLM leaderboard data and ELO scoring system
- **[shadcn/ui](https://ui.shadcn.com/)** — Beautiful, accessible React component library
- **[Next.js](https://nextjs.org/)** — The React framework for production
- **[Supabase](https://supabase.com/)** — Open source Firebase alternative
- **[Prisma](https://www.prisma.io/)** — Next-generation ORM for Node.js and TypeScript
- **[500 AI Agents Projects](https://github.com/)** — Community-curated AI agent knowledge base

---

## 📊 Project Status

| Metric | Status |
|---|---|
| **Version** | 0.2.0 |
| **Active Development** | ✅ Yes |
| **Production Ready** | 🔄 In Progress |
| **Test Coverage** | 🔄 Expanding |
| **Documentation** | ✅ Active |
| **Community** | 🌱 Growing |

---

<div align="center">

**Built with ❤️ by the Humain-Uno community**

[Report a Bug](https://github.com/Humain-Cloud/HumAIn-Uno/issues/new?template=bug_report.yml) · [Request a Feature](https://github.com/Humain-Cloud/HumAIn-Uno/issues/new?template=feature_request.yml) · [Ask a Question](https://github.com/Humain-Cloud/HumAIn-Uno/discussions)

</div>
