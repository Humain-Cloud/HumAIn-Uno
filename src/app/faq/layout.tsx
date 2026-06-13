import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Humain-Uno',
  description: 'Frequently asked questions about Humain-Uno, AI agents, frameworks, security, billing, and more.',
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
