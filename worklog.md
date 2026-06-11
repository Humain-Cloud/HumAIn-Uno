# Humain-Uno Project Worklog

## Current Project Status: Phase 10 - Architecture Optimization & Stability

### Project Overview
Humain-Uno is a production-grade web platform for browsing, learning, mixing and creating AI agents, integrating the 500-AI-Agents-Projects knowledge base. The application is built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma+SQLite, and Zustand.

### Architecture
- **Frontend**: React 18 with dynamic imports for all views (code splitting)
- **Data**: Prisma ORM with SQLite, 105 knowledge agents seeded
- **State**: Zustand store with localStorage persistence
- **API**: 23 API routes covering knowledge base, agents, admin, AI chat, stats, categories, industries
- **Views**: 8 main views (Home, Browse, Detail, Dashboard, Wizard, Admin, Knowledge Hub, Settings)
- **Components**: 60+ components split across home/, browse/, hub/, detail/, dashboard/, wizard/ directories

### Key Metrics
- **Total Agents**: 105 curated AI agents across 6 frameworks
- **Frameworks**: LangGraph (21), CrewAI (26), AutoGen (28), Agno (17), LangChain (12), LlamaIndex (1)
- **Categories**: 25 categories with agent counts
- **Industries**: 62 unique industries
- **Build**: Compiles successfully with 0 errors
- **Lint**: Passes clean with 0 errors

### Completed Modifications (This Session)

#### 1. OOM Fix: File Splitting (Critical Fix)
The original view files were 44-77KB each, causing the Next.js dev server to run out of memory during compilation. All large files were split into smaller component directories:

| Original File | Size | Split Into | New Main File Size |
|---|---|---|---|
| home-view.tsx | 76KB | 12 files in src/components/home/ | 7.4KB |
| detail-view.tsx | 77KB | 14 files in src/components/detail/ | 28KB |
| dashboard-view.tsx | 65KB | 9 files in src/components/dashboard/ | 16KB |
| wizard-view.tsx | 65KB | 8 files in src/components/wizard/ | 14.4KB |
| browse-view.tsx | 44KB | 6 files in src/components/browse/ | ~20KB |
| knowledge-hub-view.tsx | 52KB | 6 files in src/components/hub/ | ~15KB |

#### 2. Dynamic Imports (Critical Fix)
Changed all view components from static imports to `next/dynamic` imports with `ssr: false` in `app-layout.tsx`. This prevents the server from trying to compile all 400KB+ of component code at once.

#### 3. Server-Side Data Prefetch
Added server-side data fetching in `page.tsx` (server component) that pre-fetches stats, categories, recent agents, and featured agents from the database. This data is passed to the client via `initialData` prop through the `data-cache.ts` module, allowing the homepage to render with data without requiring client-side API calls.

#### 4. Production Build Verified
The production build compiles successfully with all 23 routes. The `next start` server is stable when running alone (survived 15+ minutes of continuous requests).

### Unresolved Issues / Risks

1. **Dev Server Memory Constraint**: The Next.js dev server + Chrome browser (agent-browser) together exceed the sandbox memory limit (~8GB). The dev server alone works fine, and the production server alone works fine, but running both simultaneously causes OOM kills. This is an environment constraint, not an application bug.

2. **Server-Side Data Prefetch**: The initial data is fetched on the server and passed via props, but the `ssr: false` dynamic imports prevent the data from being rendered in the initial HTML. The HomeView now has SSR enabled (no `ssr: false`), but the data flow through the cache mechanism needs further debugging. The stats section shows "0" values because the cache isn't populated before the component's useState initializer runs.

3. **Agent-Browser QA Limitation**: Full end-to-end QA with agent-browser is limited due to memory constraints. API testing with curl works perfectly. The application renders correctly in the browser but API-dependent sections may show loading states if the server dies during the session.

### Priority Recommendations for Next Phase

1. **Fix data prefetch flow**: Debug why the server-side data isn't reaching the client components through the cache mechanism. Consider using React's `use()` hook or passing data directly as props through the view component system.

2. **Remove framer-motion from critical path**: Framer-motion adds significant bundle size and memory usage. Consider replacing with CSS transitions for non-critical animations.

3. **Add error boundaries**: Add React error boundaries around each view to prevent one failing view from crashing the entire app.

4. **Implement React Suspense**: Use React Suspense boundaries with loading fallbacks for each dynamically imported view.

5. **Performance optimization**: Lazy load non-critical sections (testimonials, community, comparison table) below the fold.

6. **PWA Support**: Add service worker and manifest for offline support.

7. **Testing**: Add integration tests for critical user flows.

### Files Structure (After Split)
```
src/
├── app/
│   ├── page.tsx (server component with data prefetch)
│   ├── layout.tsx
│   ├── providers.tsx
│   └── api/ (23 API routes)
├── components/
│   ├── home/ (12 files: hero, trending, stats, how-it-works, featured, categories, frameworks, testimonials, community, cta, shared-data, animated-counter)
│   ├── browse/ (6 files: shared-data, filter-sidebar, active-filters-bar, quick-filters, agent-grid, keyboard-shortcuts-modal)
│   ├── hub/ (6 files: shared-data, hub-header, framework-tabs, trending-agents, sidebar-content, agent-grid-section)
│   ├── detail/ (14 files: shared-data, framework-color-strip, breadcrumb-nav, agent-header, agent-metadata-sidebar, overview-tab, code-tab, readme-tab, dependencies-tab, comments-tab, related-agents-section, floating-action-bar, quick-actions)
│   ├── dashboard/ (9 files: shared-data, empty-states, platform-stats-section, recent-agents-section, user-stats-section, bookmarks-section, collections-section, activity-section, settings-section)
│   ├── wizard/ (8 files: shared-data, step-indicator, source-step, info-step, code-step, config-step, review-step)
│   ├── layout/ (app-layout.tsx)
│   ├── views/ (8 view files - now much smaller)
│   ├── agents/ (agent-card, compare-bar, compare-modal, agent-quick-actions, code-playground)
│   ├── ai/ (ai-chat-button, ai-chat-panel)
│   ├── auth/ (auth-modal)
│   ├── notifications/ (notification-center)
│   └── ui/ (shadcn/ui components)
├── lib/
│   ├── store.ts (Zustand store)
│   ├── types.ts (TypeScript types)
│   ├── api-client.ts (API client)
│   ├── data-cache.ts (Client-side data cache)
│   └── db.ts (Prisma client)
└── prisma/
    └── schema.prisma (6 models)
```
