# Contributing to Humain-Uno

First off, **thank you** for considering contributing to Humain-Uno! It's people like you who make Humain-Uno a truly great platform for discovering, building, and sharing AI agents. We welcome contributions of all shapes and sizes — from bug fixes and feature additions to documentation improvements, design enhancements, and community support.

This document provides a comprehensive set of guidelines for contributing to Humain-Uno. Please read it carefully before submitting your first contribution.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Documentation Contributions](#documentation-contributions)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by the
[Humain-Uno Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are
expected to uphold this code. Please report unacceptable behavior to
**conduct@humain-uno.dev**.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** >= 1.0 (recommended)
- **Node.js** >= 20 (alternative runtime)
- **Git** >= 2.30
- A code editor with TypeScript support (we recommend [VS Code](https://code.visualstudio.com/))

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/HumAIn-Uno.git
   cd HumAIn-Uno
   ```
3. **Add the upstream** remote:
   ```bash
   git remote add upstream https://github.com/Humain-Cloud/HumAIn-Uno.git
   ```
4. **Install dependencies**:
   ```bash
   bun install
   ```

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Fill in the required variables (see [README](./README.md) for details)
3. Set up the database:
   ```bash
   bun run db:push
   bun run db:generate
   ```

### Run the Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

---

## How Can I Contribute?

There are many ways to contribute to Humain-Uno, and not all of them involve writing code:

### 🐛 Report Bugs
Found a bug? [Open a bug report](https://github.com/Humain-Cloud/HumAIn-Uno/issues/new?template=bug_report.yml) with as much detail as possible. Good bug reports make it easy for maintainers to reproduce and fix issues quickly.

### 💡 Suggest Enhancements
Have an idea for a new feature or improvement? [Open a feature request](https://github.com/Humain-Cloud/HumAIn-Uno/issues/new?template=feature_request.yml) describing your idea, the problem it solves, and any alternatives you've considered.

### 🔧 Submit Code
Fix a bug or implement a feature! Fork the repo, create a branch, make your changes, and submit a pull request.

### 📝 Improve Documentation
Documentation is just as important as code. Fix typos, add examples, improve guides, or write new documentation for features that lack it.

### 🎨 Design & UX
Help improve the user interface and experience. Submit design proposals, accessibility improvements, or UX enhancements.

### 🌍 Translations
Help make Humain-Uno accessible to users worldwide by contributing translations and localization support.

### 💬 Help Others
Answer questions in discussions, review pull requests, triage issues, and help other contributors get up to speed.

---

## Development Setup

### Tech Stack Overview

Humain-Uno is built with:

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Runtime** | Bun |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM (SQLite dev / Supabase PostgreSQL prod) |
| **State** | Zustand (client) + TanStack Query (server) |
| **Forms** | React Hook Form + Zod |
| **Animation** | Framer Motion |
| **Auth** | NextAuth.js v4 + Supabase Auth |
| **AI** | z-ai-web-dev-sdk |

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Context providers
│   ├── globals.css         # Global styles + CSS variables
│   ├── browse/             # Agent browsing page
│   ├── agents/[id]/        # Agent detail page
│   ├── dashboard/          # User dashboard
│   ├── create/             # Agent creation wizard
│   ├── llm-finder/         # LLM model finder
│   ├── knowledge-base/     # Knowledge hub
│   ├── settings/           # User settings
│   ├── auth/               # Authentication pages
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn/ui primitives (DO NOT manually edit)
│   ├── views/              # Page-level view components
│   ├── layout/             # Navbar, Footer, DynamicLayout
│   ├── home/               # Home page section components
│   ├── browse/             # Browse page components
│   ├── detail/             # Agent detail components
│   ├── llm-finder/         # LLM model finder components
│   ├── wizard/             # Agent creation wizard steps
│   ├── ai/                 # AI chat components
│   └── shared/             # Shared/reusable components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── store.ts            # Zustand global store
│   ├── api-client.ts       # Typed API client
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── utils.ts            # Utility functions
│   └── supabase/           # Supabase client configurations
├── hooks/                  # Custom React hooks
└── middleware.ts           # Auth session refresh middleware
```

### Key Conventions

- **App Router**: All routes use Next.js 16 App Router (not Pages Router)
- **Server Components by Default**: React Server Components are the default; use `'use client'` only when needed (state, effects, event handlers, browser APIs)
- **API Routes**: All backend logic uses Next.js API Route Handlers (`route.ts` files)
- **Database Access**: Use `import { db } from '@/lib/db'` for Prisma client
- **No Server Actions**: Use API routes, not React Server Actions
- **UI Components**: Use existing shadcn/ui components from `src/components/ui/`; don't build from scratch
- **TypeScript**: Strict mode is enabled; all code must be properly typed
- **Environment Variables**: Use `process.env` on server, `NEXT_PUBLIC_` prefix for client

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled — no `any` types without explicit justification
- Use **interfaces** for object shapes, **type aliases** for unions/intersections
- **Explicit return types** for exported functions and API handlers
- Use **ES modules** (`import`/`export`) — no CommonJS (`require`)
- Prefer **readonly** for constant data structures

```typescript
// ✅ Good
interface AgentCardProps {
  readonly agent: Agent;
  readonly onStar: (id: string) => Promise<void>;
  readonly isBookmarked: boolean;
}

// ❌ Bad
interface AgentCardProps {
  agent: any;
  onStar: Function;
  isBookmarked: boolean;
}
```

### React Components

- **Functional components only** — no class components
- **Named exports** preferred over default exports
- Use `'use client'` directive only when the component requires:
  - React state (`useState`, `useReducer`)
  - Side effects (`useEffect`, `useLayoutEffect`)
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onChange`, etc.)
- **Props interface** defined above the component
- **Destructure props** in the function signature

```typescript
// ✅ Good
interface ModelCardProps {
  readonly model: LLMModel;
  readonly onSelect: (id: string) => void;
  readonly isSelected?: boolean;
}

export function ModelCard({ model, onSelect, isSelected = false }: ModelCardProps) {
  // ...
}
```

### Styling

- **Tailwind CSS** for all styling — no inline styles or CSS modules
- Use **shadcn/ui** CSS variables (`bg-primary`, `text-primary-foreground`, etc.)
- **No indigo or blue** colors unless explicitly requested
- **Responsive design** — mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Dark mode** support via `next-themes` (class-based strategy)
- **Minimum 44px touch targets** for interactive elements

### API Routes

- Follow **RESTful conventions** for API endpoints
- Use **Zod** for request validation and response typing
- Return proper **HTTP status codes** (200, 201, 400, 401, 404, 500)
- Handle errors gracefully with descriptive messages
- Use `import { db } from '@/lib/db'` for database access

```typescript
// ✅ Good - Proper API route handler
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10),
  categoryId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateAgentSchema.parse(body);

    const agent = await db.agent.create({ data });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Database (Prisma)

- Use **Prisma Client** for all database operations
- **Schema changes**: Edit `prisma/schema.prisma`, then run `bun run db:push`
- **No raw SQL** unless absolutely necessary (document why)
- **Indexed fields**: Add `@@index` for frequently queried fields
- **CUIDs** for primary keys (Prisma default)
- **Soft deletes** preferred over hard deletes where applicable

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring without feature changes or bug fixes |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance tasks, tooling changes |
| `revert` | Reverting a previous commit |

### Scopes

Common scopes include: `api`, `ui`, `auth`, `db`, `llm-finder`, `agents`, `wizard`, `search`, `notifications`, `dashboard`, `settings`, `admin`

### Examples

```
feat(llm-finder): add model comparison side-by-side view
fix(auth): resolve session refresh race condition on SSR
docs(readme): add API overview section and badge shields
refactor(api-client): extract shared fetch logic into base method
perf(browse): implement virtualized list for 800+ agents
chore(deps): update Next.js to 16.1.1
```

### Commit Message Rules

1. Use the **imperative mood** ("add feature" not "added feature")
2. Keep the subject line under **72 characters**
3. **Do not end** the subject line with a period
4. Use the **body** to explain *what* and *why* (not *how*)
5. **Reference issues** in the footer: `Closes #123`, `Fixes #456`, `Refs #789`

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**: Ensure your branch is up to date with `main`
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Lint your code**: Run `bun run lint` and fix any issues
3. **Test your changes**: Verify the application works correctly with your changes
4. **Update documentation**: If you changed behavior, update the relevant documentation

### PR Title Format

Follow the same convention as commit messages:

```
feat(scope): brief description of the change
fix(scope): brief description of the fix
```

### PR Description Template

All pull requests should include:

1. **Summary** — What does this PR do and why?
2. **Related Issues** — Link to any related issues (`Closes #123`)
3. **Type of Change** — Bug fix, new feature, breaking change, etc.
4. **How Has This Been Tested?** — Describe your testing approach
5. **Screenshots** — For UI changes, include before/after screenshots
6. **Checklist** — Confirm all items are completed

### PR Size Guidelines

We encourage **small, focused pull requests**:

| Size | Lines Changed | Description |
|---|---|---|
| 🟢 Small | < 200 | Bug fixes, minor features, docs |
| 🟡 Medium | 200–500 | New features, significant refactors |
| 🔴 Large | > 500 | Major features, architectural changes |

For large changes, consider breaking them into a series of smaller PRs. If a large PR is unavoidable, provide extra context in the description and consider requesting early feedback with a draft PR.

### Review Process

1. **Automated checks** must pass (lint, type-check)
2. At least **one approval** from a maintainer is required
3. Address all review comments — even if you disagree, respond respectfully
4. **Resolve conversations** after addressing feedback
5. **Squash merge** is the default merge strategy

### After Merge

- Delete your feature branch
- Sync your fork with upstream
- Celebrate! 🎉

---

## Code Review Guidelines

### For Reviewers

- **Be respectful** and constructive in feedback
- **Explain why** — not just what should change
- **Ask questions** rather than make demands ("What do you think about...?" vs. "You should...")
- **Focus on the code**, not the person
- **Acknowledge good work** — highlight things done well, not just issues
- **Prioritize feedback**:
  1. Correctness (bugs, security issues)
  2. Performance and scalability
  3. Code clarity and maintainability
  4. Style and conventions
- **Limit nitpicking** — stylistic preferences that don't affect functionality can be noted but shouldn't block merge

### For Authors

- **Don't take feedback personally** — reviews are about the code, not you
- **Respond to all comments**, even if just acknowledging
- **Ask for clarification** if feedback is unclear
- **Push fixes** as new commits (don't force-push during review)
- **Mark conversations as resolved** after addressing

---

## Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with the latest version** — the bug may already be fixed
3. **Gather information**: browser, OS, steps to reproduce, error messages

### Bug Report Template

When filing a bug report, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Environment**: Browser, OS, device
- **Additional Context**: Any other relevant information

See our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) for the full template.

---

## Suggesting Enhancements

### Before Suggesting

1. **Search existing issues and discussions** — your idea may already be proposed
2. **Check the roadmap** — it may already be planned
3. **Consider the scope** — is this a small improvement or a major feature?

### Feature Request Template

When suggesting an enhancement, please include:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How would you like it to work?
- **Alternatives Considered**: What other approaches did you consider?
- **Additional Context**: Screenshots, mockups, links to similar features in other tools

See our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) for the full template.

---

## Documentation Contributions

Documentation is a critical part of Humain-Uno. We welcome improvements to:

- **README.md** — Project overview, setup, and usage
- **CONTRIBUTING.md** — This file
- **API Documentation** — Endpoint descriptions, request/response formats
- **Code Comments** — Inline documentation for complex logic
- **Component Documentation** — Props, usage examples, and design decisions
- **Guides and Tutorials** — Step-by-step guides for common tasks

### Documentation Standards

- Use **Markdown** for all documentation
- Include **code examples** where applicable
- Keep documentation **up to date** with code changes
- Use **present tense** and **active voice**
- Include **table of contents** for long documents

---

## Community

### Get Help

- **GitHub Discussions** — Ask questions, share ideas, and connect with other contributors
- **GitHub Issues** — Report bugs or request features
- **Email** — Reach out to maintainers at hello@humain-uno.dev

### Stay Updated

- **Watch the repository** for release announcements
- **Star the repository** to show your support
- **Follow the project** for the latest updates

### Recognition

We value all contributions and recognize contributors through:

- **Contributors list** in the repository
- **Release notes** crediting contributors
- **Community spotlights** for significant contributions

---

## Quick Reference

| Task | Command |
|---|---|
| Install dependencies | `bun install` |
| Start dev server | `bun run dev` |
| Run linter | `bun run lint` |
| Push database schema | `bun run db:push` |
| Generate Prisma client | `bun run db:generate` |
| Build for production | `bun run build` |
| Create feature branch | `git checkout -b feature/your-feature` |

---

Thank you for contributing to Humain-Uno! Your efforts help make AI agents more accessible, discoverable, and useful for everyone. 💛
