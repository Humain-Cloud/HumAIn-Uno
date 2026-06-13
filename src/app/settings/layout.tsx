import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings - Humain-Uno',
  description: 'Manage your Humain-Uno preferences, appearance, search settings, and data.',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
