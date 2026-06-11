# Task 3: Reading Progress Bar, Scroll-to-Top, and Detail View TOC Sidebar

## Task ID: 3
## Agent: Main Agent
## Status: Completed

## Summary
Added three UX enhancements to the Humain-Uno project:
1. Reading Progress Bar (global, in AppLayout)
2. Scroll-to-Top Button (global, in AppLayout)
3. Table of Contents Sidebar (detail view only)

## Files Modified
- `src/components/layout/app-layout.tsx` — Added reading progress bar + scroll-to-top button
- `src/components/views/detail-view.tsx` — Added TOC sidebar, section IDs, restructured layout

## Changes Detail

### AppLayout (`src/components/layout/app-layout.tsx`)
- Added `ArrowUp` icon import from lucide-react
- Added `useMemo` to React imports (for consistency, though not strictly needed)
- Added `scrollProgress`, `showScrollTop`, `showProgressBar` state variables
- Added scroll event listener that tracks progress percentage and visibility thresholds
- Added `<motion.div>` reading progress bar (fixed, top: 4rem, z-100, emerald-to-cyan gradient)
  - Uses `.reading-progress` CSS class from globals.css
  - Only visible when `showProgressBar && scrollProgress > 0`
- Added `<motion.button>` scroll-to-top button (fixed, bottom-40 right-6, z-40)
  - Positioned above AI Chat button (which is at bottom-24 right-6 z-50) to avoid overlap
  - Emerald gradient background with ArrowUp icon
  - Appears when scrollY > 400px
  - Smooth scroll to top on click

### Detail View (`src/components/views/detail-view.tsx`)
- Added `Eye`, `List` icon imports from lucide-react
- Added `activeSection` state for TOC tracking
- Added IntersectionObserver effect to detect which section is in view
  - Observes: section-overview, section-code, section-dependencies, section-comments
  - rootMargin: '-20% 0px -60% 0px'
  - Dependencies: [loading, activeTab, agent]
- Added `scrollToSection()` function for smooth scrolling to sections
- Added `tocItems` memoized array with dynamic items (Code only shown if codeSnippet exists)
- Restructured return JSX:
  - Wrapped in `flex gap-6 max-w-7xl` container
  - TOC sidebar `<aside>` on left (hidden xl:block, w-48)
  - Main content `<div>` on right (flex-1 min-w-0 max-w-5xl)
- Added `id` attributes to TabsContent elements:
  - `id="section-overview"` on overview tab
  - `id="section-code"` on code tab
  - `id="section-dependencies"` on dependencies tab
  - `id="section-comments"` on comments tab

## Verification
- ✅ Lint passes clean (0 errors)
- ✅ No store modifications
- ✅ No new files created
- ✅ Dev server compiles successfully
