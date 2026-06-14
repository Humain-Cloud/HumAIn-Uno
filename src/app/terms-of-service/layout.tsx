import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Humain-Uno',
  description: 'Read the terms and conditions governing your use of the Humain-Uno AI Agent Marketplace, including user accounts, API usage, warranties, and dispute resolution.',
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
