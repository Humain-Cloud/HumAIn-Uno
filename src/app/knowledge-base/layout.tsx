import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knowledge Hub - Humain-Uno',
  description: 'Explore the AI Agent Knowledge Hub. Discover trending agents, browse by framework, and find the perfect starting point.',
}

export default function KnowledgeBaseLayout({ children }: { children: React.ReactNode }) {
  return children
}
