import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse AI Agents - Humain-Uno',
  description: 'Browse 800+ curated AI agents across 49 categories and 5 frameworks. Filter by industry, difficulty, and more.',
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children
}
