'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bot, Github, Twitter, Mail, Compass, Library, BookOpen, FileText, Shield, Scale, MessageCircle, Youtube, Rss, HeartHandshake, GraduationCap } from 'lucide-react'

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Agents', icon: Compass, href: '/browse' },
      { label: 'Knowledge Hub', icon: Library, href: '/knowledge-base' },
      { label: 'Settings', icon: Shield, href: '/settings' },
      { label: 'Create Agent', icon: Bot, href: '/?view=create' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', icon: BookOpen, href: '#' },
      { label: 'API Reference', icon: FileText, href: '#' },
      { label: 'Tutorials', icon: GraduationCap, href: '#' },
      { label: 'Blog', icon: FileText, href: '#' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', icon: Github, href: 'https://github.com/Humain-Cloud/HumAIn-Uno' },
      { label: 'Discord', icon: MessageCircle, href: '#' },
      { label: 'Twitter', icon: Twitter, href: '#' },
      { label: 'Contributing', icon: HeartHandshake, href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', icon: Shield, href: '#' },
      { label: 'Terms of Service', icon: Scale, href: '#' },
      { label: 'License (MIT)', icon: FileText, href: '#' },
      { label: 'Contact', icon: Mail, href: '#' },
    ],
  },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com/Humain-Cloud/HumAIn-Uno', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Rss, href: '#', label: 'RSS' },
]

export function Footer() {
  const router = useRouter()

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <button
                        onClick={() => router.push(link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 min-h-[24px]"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 min-h-[24px]"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Copyright and frameworks */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-xs text-muted-foreground">
              © 2025 Humain-Uno. Powered by 800+ AI Agents Knowledge Base
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">LangGraph</span>
              <span>·</span>
              <span className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors">CrewAI</span>
              <span>·</span>
              <span className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors">AutoGen</span>
              <span>·</span>
              <span className="hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors">Agno</span>
              <span>·</span>
              <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">LlamaIndex</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
