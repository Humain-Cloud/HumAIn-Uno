import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Humain-Uno',
  description: 'Learn how Humain-Uno collects, uses, and protects your personal information. Our privacy policy covers AI agent data processing, user rights, cookies, and more.',
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
