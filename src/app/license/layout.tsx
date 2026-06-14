import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MIT License | Humain-Uno',
  description: 'Understand the MIT License that governs agent code on the Humain-Uno marketplace. Learn what it allows, requires, and how it applies to AI agents.',
}

export default function LicenseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
