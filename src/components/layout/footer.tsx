'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Bot,
  Github,
  Twitter,
  MessageCircle,
  Youtube,
  Mail,
  Linkedin,
  Rss,
  Shield,
  FileText,
  Scale,
  BookOpen,
  Lock,
  CheckCircle2,
  ChevronDown,
  Send,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Sitemap columns data
const sitemapColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Agents', href: '/browse' },
      { label: 'Knowledge Hub', href: '/knowledge-base' },
      { label: 'Featured Agents', href: '/browse?sort=featured' },
      { label: 'Collections', href: '/browse?view=collections' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'System Status', href: '/status' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '/docs', external: true },
      { label: 'API Reference', href: '/docs/api', external: true },
      { label: 'SDK', href: '/docs/sdk', external: true },
      { label: 'Build an Agent', href: '/create' },
      { label: 'Submit an Agent', href: '/create' },
      { label: 'Developer Forum', href: 'https://community.humain-uno.com', external: true },
      { label: 'Open Source', href: 'https://github.com/humain-uno', external: true },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Enterprise', href: '/enterprise' },
      { label: 'For Startups', href: '/startups' },
      { label: 'For Developers', href: '/developers' },
      { label: 'Industry Solutions', href: '/industries' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Customer Stories', href: '/customers' },
      { label: 'Security & Compliance', href: '/security' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Tutorials', href: '/tutorials' },
      { label: 'Webinars', href: '/webinars' },
      { label: 'Help Center', href: '/help', external: true },
      { label: 'Partner Program', href: '/partners' },
      { label: 'Brand Assets', href: '/brand' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers', badge: "We're Hiring" },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
      { label: 'AI Safety & Ethics', href: '/ethics' },
      { label: 'Research', href: '/research' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg/humain-uno', external: true },
      { label: 'GitHub', href: 'https://github.com/humain-uno', external: true },
      { label: 'X (Twitter)', href: 'https://twitter.com/humain_uno', external: true },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/humain-uno', external: true },
      { label: 'YouTube', href: 'https://youtube.com/@humain-uno', external: true },
      { label: 'Reddit', href: 'https://reddit.com/r/humainuno', external: true },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
]

// Trust badges
const trustBadges = [
  { label: 'SOC 2 Type II', icon: Shield },
  { label: 'ISO 27001', icon: Lock },
  { label: 'GDPR Compliant', icon: Scale },
  { label: 'HIPAA Ready', icon: Heart },
  { label: 'EU AI Act', icon: FileText },
  { label: 'CCPA', icon: CheckCircle2 },
]

// Legal links
const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Acceptable Use', href: '/acceptable-use' },
  { label: 'DPA', href: '/dpa' },
  { label: 'SLA', href: '/sla' },
  { label: 'Security', href: '/security' },
  { label: 'Responsible AI', href: '/responsible-ai' },
]

// Social links
const socialLinks = [
  { icon: Github, href: 'https://github.com/humain-uno', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/humain_uno', label: 'X' },
  { icon: MessageCircle, href: 'https://discord.gg/humain-uno', label: 'Discord' },
  { icon: Linkedin, href: 'https://linkedin.com/company/humain-uno', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@humain-uno', label: 'YouTube' },
]

// Framework badges
const frameworkBadges = [
  { label: 'LangGraph', color: 'text-emerald-500' },
  { label: 'CrewAI', color: 'text-amber-500' },
  { label: 'AutoGen', color: 'text-rose-500' },
  { label: 'Agno', color: 'text-violet-500' },
  { label: 'LlamaIndex', color: 'text-teal-500' },
]

// Mobile accordion column
function AccordionColumn({ title, links }: { title: string; links: typeof sitemapColumns[0]['links'] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="space-y-2.5">
          {links.map((link) => (
            <li key={link.label}>
              {'external' in link && link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors"
                >
                  {link.label}
                  {'badge' in link && link.badge && (
                    <Badge className="ml-1.5 text-[9px] px-1.5 py-0 h-4 bg-emerald-600 text-white border-0 font-medium">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    setSubscribeLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubscribed(true)
    setSubscribeLoading(false)
    setEmail('')
  }

  return (
    <footer className="mt-auto bg-gray-950 dark:bg-black">
      {/* TIER 1 - Newsletter / CTA Band */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
            <div className="text-center lg:text-left max-w-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Stay ahead with the latest AI agents & updates
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Join 12,000+ developers getting weekly insights on new agents, frameworks, and best practices.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 rounded-lg px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">You&apos;re subscribed! Check your inbox for confirmation.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 sm:w-72 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 rounded-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={subscribeLoading}
                    className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg shadow-md shadow-emerald-900/30 transition-all min-w-[120px]"
                  >
                    {subscribeLoading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </form>
              )}
              <p className="text-[11px] text-gray-500 mt-2 text-center sm:text-left">
                No spam, ever. Unsubscribe at any time.{' '}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-300 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2 - 6-Column Sitemap Grid */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Desktop: 6 columns */}
          <div className="hidden lg:grid lg:grid-cols-6 gap-8">
            {sitemapColumns.map((column) => (
              <div key={column.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1.5"
                        >
                          {link.label}
                          {'badge' in link && link.badge && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-600 text-white border-0 font-medium">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tablet: 3 columns */}
          <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-8">
            {sitemapColumns.map((column) => (
              <div key={column.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1.5"
                        >
                          {link.label}
                          {'badge' in link && link.badge && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-600 text-white border-0 font-medium">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile: accordion */}
          <div className="md:hidden">
            {sitemapColumns.map((column) => (
              <AccordionColumn key={column.title} title={column.title} links={column.links} />
            ))}
          </div>
        </div>
      </div>

      {/* TIER 3 - Trust & Compliance Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {trustBadges.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900/50"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[11px] font-medium text-gray-300">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>We protect your data.</span>
            </p>
          </div>
        </div>
      </div>

      {/* TIER 4 - Legal Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-6">
          {/* Top row: Logo + Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                Humain<span className="text-emerald-400">-Uno</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © 2025 Humain-Uno, Inc. All rights reserved.
            </p>
          </div>

          {/* Middle row: Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {legalLinks.map((link, i) => (
              <span key={link.label} className="flex items-center">
                <Link
                  href={link.href}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
                {i < legalLinks.length - 1 && (
                  <span className="ml-4 text-gray-700">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Bottom row: Social icons + Framework badges */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Framework badges */}
            <div className="flex items-center gap-3 text-xs">
              {frameworkBadges.map(({ label, color }, i) => (
                <span key={label} className="flex items-center">
                  <span className={`${color} font-medium hover:underline underline-offset-2 cursor-default transition-opacity hover:opacity-80`}>
                    {label}
                  </span>
                  {i < frameworkBadges.length - 1 && (
                    <span className="ml-3 text-gray-700">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
