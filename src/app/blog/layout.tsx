import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Humain-Uno',
  description: 'Insights, tutorials, and deep dives on building AI agents. Learn from the community and our team.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
