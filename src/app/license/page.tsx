'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Scale,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code,
  GitBranch,
  Users,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Mail,
  Menu,
  X,
  ArrowUp,
  Shield,
  Copy,
  ExternalLink,
} from 'lucide-react'

const LAST_UPDATED = 'March 4, 2026'

const tocSections = [
  { id: 'full-mit-license', label: 'Full MIT License Text', icon: FileText },
  { id: 'what-it-allows', label: 'What the MIT License Allows', icon: CheckCircle2 },
  { id: 'what-it-requires', label: 'What the MIT License Requires', icon: AlertTriangle },
  { id: 'what-it-does-not', label: 'What It Does NOT Provide', icon: XCircle },
  { id: 'applies-to-humain-uno', label: 'How This Applies to Humain-Uno', icon: Scale },
  { id: 'third-party-licenses', label: 'Third-Party Framework Licenses', icon: Code },
  { id: 'agent-licensing', label: 'Agent-Specific Licensing', icon: GitBranch },
  { id: 'contributing', label: 'Contributing Under MIT', icon: Users },
  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function SectionTitle({ id, icon: Icon, children }: { id: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{children}</h2>
      </div>
    </div>
  )
}

function SubSection({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">{children}</h3>
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-muted-foreground leading-relaxed mb-2">
      <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
      <span>{children}</span>
    </li>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="border">
      <CardContent className="p-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-start gap-3 text-left"
        >
          <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{question}</h4>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{answer}</p>
              </motion.div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </CardContent>
    </Card>
  )
}

export default function LicensePage() {
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('full-mit-license')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 400)
    const sections = tocSections.map((s) => s.id)
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i])
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 150) {
          setActiveSection(sections[i])
          return
        }
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileTocOpen(false)
    }
  }

  const copyLicense = () => {
    navigator.clipboard.writeText(`MIT License

Copyright (c) ${new Date().getFullYear()} Humain-Uno, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent dark:from-emerald-800/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/legal">Legal</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>MIT License</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 shrink-0">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">MIT License</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Understanding the open-source license that powers the Humain-Uno ecosystem
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                  <FileText className="h-3 w-3" />
                  Last Updated: {LAST_UPDATED}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  OSI Approved
                </Badge>
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1">
                  SPDX Identifier: MIT
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex gap-8">
          {/* Desktop TOC Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Table of Contents
                  </h3>
                  <ScrollArea className="h-[calc(100vh-180px)]">
                    <nav className="space-y-0.5">
                      {tocSections.map((section) => {
                        const Icon = section.icon
                        const isActive = activeSection === section.id
                        return (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {section.label}
                          </button>
                        )
                      })}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile TOC Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              size="icon"
            >
              {mobileTocOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile TOC Drawer */}
          {mobileTocOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="lg:hidden fixed inset-x-4 bottom-20 z-40"
            >
              <Card className="shadow-xl border-2 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 max-h-80 overflow-y-auto">
                  <h3 className="text-sm font-semibold mb-3">Table of Contents</h3>
                  <nav className="space-y-0.5">
                    {tocSections.map((section) => {
                      const Icon = section.icon
                      const isActive = activeSection === section.id
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {section.label}
                        </button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {/* Intro */}
            <motion.div {...fadeInUp} viewport={{ once: true }} className="mb-10">
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The MIT License is one of the most popular and permissive open-source licenses in the software industry. It is used by thousands of projects worldwide, including major frameworks like React, Node.js, and jQuery. At Humain-Uno, we use the MIT License as the default license for all agent code published on our marketplace, reflecting our commitment to open-source collaboration and innovation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 1: Full MIT License Text */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="full-mit-license" icon={FileText}>1. Full MIT License Text</SectionTitle>
              <Paragraph>
                The following is the complete text of the MIT License, as approved by the Open Source Initiative (OSI). This is the license under which all default agent code on the Humain-Uno marketplace is published:
              </Paragraph>

              <Card className="border mb-4">
                <CardContent className="p-6 relative">
                  <Button
                    onClick={copyLicense}
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1.5 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                  <div className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pr-16">
{`MIT License

Copyright (c) ${new Date().getFullYear()} Humain-Uno, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
                  </div>
                </CardContent>
              </Card>

              <Paragraph>
                The MIT License is identified by the SPDX License Identifier <Badge variant="outline" className="text-xs font-mono">MIT</Badge> and is classified as a permissive license by the Open Source Initiative. It is compatible with the GNU GPL, Apache License 2.0, and most other open-source licenses.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 2: What the MIT License Allows */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="what-it-allows" icon={CheckCircle2}>2. What the MIT License Allows</SectionTitle>
              <Paragraph>
                The MIT License is one of the most permissive open-source licenses available. It grants broad rights to users and developers, making it ideal for fostering collaboration and innovation. Here is what the MIT License allows you to do:
              </Paragraph>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {[
                  { title: 'Commercial Use', desc: 'You may use the software in commercial products and services without paying royalties or licensing fees. You can sell products that incorporate MIT-licensed code.', icon: '💰' },
                  { title: 'Modification', desc: 'You may modify the source code to suit your needs. You can add features, fix bugs, optimize performance, or adapt the code for different use cases.', icon: '✏️' },
                  { title: 'Distribution', desc: 'You may distribute the original or modified software to others. You can share it freely, include it in your projects, or redistribute it as part of a larger work.', icon: '📦' },
                  { title: 'Sublicensing', desc: 'You may grant sublicenses to others, allowing them to use the software under the same or different terms. You can incorporate MIT-licensed code into projects with stricter licenses.', icon: '🔑' },
                  { title: 'Private Use', desc: 'You may use the software internally within your organization without any obligation to share your modifications or internal use with the public.', icon: '🔒' },
                  { title: 'Integration', desc: 'You may integrate MIT-licensed code into proprietary software. The MIT License does not require you to open-source your own code that merely uses or links to MIT-licensed code.', icon: '🔗' },
                ].map((item) => (
                  <Card key={item.title} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 3: What the MIT License Requires */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="what-it-requires" icon={AlertTriangle}>3. What the MIT License Requires</SectionTitle>
              <Paragraph>
                While the MIT License is extremely permissive, it does impose a small number of important requirements that you must follow when using MIT-licensed software:
              </Paragraph>

              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 mb-6">
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Include the Copyright Notice</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You must include the original copyright notice (&quot;Copyright (c) [year] [author]&quot;) in all copies or substantial portions of the Software. This ensures the original creator receives proper attribution for their work.
                        </p>
                      </div>
                    </li>
                    <Separator />
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Include the License Text</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You must include a copy of the MIT License text (the permission notice) in all copies or substantial portions of the Software. This is typically done by including the LICENSE file in your project or embedding the license text in your source code headers.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Paragraph>
                These are the only requirements. The MIT License does not require you to share your source code, publish your modifications, or notify the original author when you use the software. It does not impose copyleft restrictions like the GPL, meaning you can use MIT-licensed code in closed-source, proprietary projects.
              </Paragraph>

              <SubSection>Common Ways to Comply</SubSection>
              <ul className="ml-2 mb-6">
                <ListItem>Include the original LICENSE file in your project root alongside your own license</ListItem>
                <ListItem>Add a license header comment to modified source files indicating the original MIT License</ListItem>
                <ListItem>Include attribution in your project&apos;s README, about page, or credits section</ListItem>
                <ListItem>Use automated tooling like <code className="text-xs bg-muted px-1.5 py-0.5 rounded">license-checker</code> to verify all dependencies are properly attributed</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 4: What It Does NOT Provide */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="what-it-does-not" icon={XCircle}>4. What the MIT License Does NOT Provide</SectionTitle>
              <Paragraph>
                Understanding the limitations of the MIT License is equally important. The following are explicitly disclaimed and not provided under the MIT License:
              </Paragraph>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {[
                  { title: 'No Warranty', desc: 'The software is provided "AS IS" without warranty of any kind. There is no guarantee of merchantability, fitness for a particular purpose, or non-infringement. Use at your own risk.', severity: 'high' },
                  { title: 'No Liability', desc: 'The authors or copyright holders shall not be liable for any claim, damages, or other liability arising from the use of the software. You assume all risk associated with using the software.', severity: 'high' },
                  { title: 'No Trademark Rights', desc: 'The MIT License does not grant any trademark rights. You cannot use the names, logos, or brands of the original authors to endorse or promote your products without separate permission.', severity: 'medium' },
                  { title: 'No Patent Rights', desc: 'The MIT License does not explicitly grant patent rights. While it grants a broad license to "deal in the Software," it does not include an explicit patent grant like the Apache License 2.0 does.', severity: 'medium' },
                  { title: 'No Support Obligation', desc: 'The original authors are under no obligation to provide support, maintenance, updates, or bug fixes for the software. Any support provided is voluntary.', severity: 'low' },
                  { title: 'No Guarantee of Updates', desc: 'There is no obligation for the original author to continue developing or maintaining the software. You may need to maintain your own fork if you rely on specific features.', severity: 'low' },
                ].map((item) => (
                  <Card key={item.title} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className={`h-4 w-4 shrink-0 mt-0.5 ${
                          item.severity === 'high' ? 'text-rose-500' : item.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 5: How This Applies to Humain-Uno */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="applies-to-humain-uno" icon={Scale}>5. How This Applies to Humain-Uno</SectionTitle>
              <Paragraph>
                The MIT License applies to the Humain-Uno ecosystem in several distinct ways. Understanding these distinctions is important for both users and contributors:
              </Paragraph>

              <SubSection>5.1 Agent Code on the Marketplace</SubSection>
              <Paragraph>
                All agent code published on the Humain-Uno marketplace is licensed under the MIT License by default. This means you are free to use, modify, and distribute any agent code you find on the marketplace for any purpose, including commercial purposes, as long as you include the original copyright notice and MIT License text with any substantial portions of the code you distribute.
              </Paragraph>

              <SubSection>5.2 The Humain-Uno Platform Itself</SubSection>
              <Paragraph>
                The Humain-Uno platform, including our web application, API services, and infrastructure, is proprietary software owned by Humain-Uno, Inc. The MIT License applies only to the agent code published on the marketplace, not to the platform itself. Access to and use of the platform is governed by our <Link href="/terms-of-service" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</Link>.
              </Paragraph>

              <SubSection>5.3 Curated Knowledge Base Content</SubSection>
              <Paragraph>
                The curated metadata, categorizations, framework compatibility data, and editorial content within our Knowledge Base are the proprietary property of Humain-Uno. While the agent code itself is MIT-licensed, our editorial additions, quality assessments, and curated collections are not. You may not reproduce our knowledge base content in bulk without written permission.
              </Paragraph>

              <SubSection>5.4 Platform Documentation</SubSection>
              <Paragraph>
                Official Humain-Uno documentation, including API documentation, integration guides, and tutorials, is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). This allows you to share and adapt the documentation for any purpose, including commercial, as long as you provide appropriate credit to Humain-Uno.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 6: Third-Party Framework Licenses */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="third-party-licenses" icon={Code}>6. Third-Party Framework Licenses</SectionTitle>
              <Paragraph>
                The Humain-Uno marketplace supports agents built on several major AI frameworks. Each framework has its own open-source license, which may impose additional requirements beyond the MIT License that applies to agent code. Here is a summary of the licenses for each supported framework:
              </Paragraph>

              <div className="space-y-4 mb-6">
                {[
                  {
                    name: 'LangGraph',
                    license: 'MIT License',
                    spdx: 'MIT',
                    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                    desc: 'LangGraph, developed by LangChain, is licensed under the MIT License. This means agents built with LangGraph inherit no additional licensing constraints beyond the MIT License. You are free to use, modify, and distribute LangGraph-based agents commercially.',
                    repo: 'https://github.com/langchain-ai/langgraph',
                  },
                  {
                    name: 'CrewAI',
                    license: 'MIT License',
                    spdx: 'MIT',
                    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                    desc: 'CrewAI is also licensed under the MIT License, providing full commercial freedom. Agents using CrewAI\'s multi-agent collaboration framework can be freely used, modified, and distributed without additional licensing obligations.',
                    repo: 'https://github.com/crewAIInc/crewAI',
                  },
                  {
                    name: 'AutoGen',
                    license: 'MIT License',
                    spdx: 'MIT',
                    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                    desc: 'Microsoft\'s AutoGen framework is licensed under the MIT License. This permissive license allows commercial use, modification, and distribution of AutoGen-based agents without additional constraints or royalty requirements.',
                    repo: 'https://github.com/microsoft/autogen',
                  },
                  {
                    name: 'Agno',
                    license: 'MPL-2.0',
                    spdx: 'MPL-2.0',
                    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
                    desc: 'Agno uses the Mozilla Public License 2.0 (MPL-2.0), which is a weak copyleft license. This means modifications to Agno itself must be shared under MPL-2.0, but your own agent code that uses Agno as a library can be licensed independently. Agent code on our marketplace is still MIT-licensed.',
                    repo: 'https://github.com/agno-agi/agno',
                  },
                  {
                    name: 'LlamaIndex',
                    license: 'MIT License',
                    spdx: 'MIT',
                    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
                    desc: 'LlamaIndex is licensed under the MIT License. Agents built using LlamaIndex\'s data framework for LLM applications can be freely used, modified, and distributed for any purpose, including commercial applications.',
                    repo: 'https://github.com/run-llama/llama_index',
                  },
                ].map((fw) => (
                  <Card key={fw.name} className="border">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <Badge className={`${fw.badgeClass} border-0 text-xs shrink-0 self-start`}>
                          {fw.name}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">{fw.license}</span>
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">{fw.spdx}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">{fw.desc}</p>
                          <a
                            href={fw.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                          >
                            View repository <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Note:</strong> While agent code on our marketplace is MIT-licensed, the underlying frameworks may have their own license terms that apply to framework-level code. If you modify a framework itself (not just your agent code), you must comply with that framework&apos;s license. The Agno framework uses MPL-2.0, which requires sharing modifications to the framework code under the same license.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 7: Agent-Specific Licensing */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="agent-licensing" icon={GitBranch}>7. Agent-Specific Licensing</SectionTitle>
              <Paragraph>
                While the MIT License is the default for agent code on the Humain-Uno marketplace, we understand that some projects may require different licensing terms. Here is how agent-specific licensing works:
              </Paragraph>

              <SubSection>7.1 Default MIT License</SubSection>
              <Paragraph>
                By default, all agent code submitted to the Humain-Uno marketplace is licensed under the MIT License. This is the simplest and most widely compatible option, and it encourages maximum collaboration and reuse. When you submit an agent, it will be published with an MIT License unless you specify otherwise.
              </Paragraph>

              <SubSection>7.2 Alternative Licenses</SubSection>
              <Paragraph>
                If you wish to publish your agent under a different open-source license, you may do so by clearly specifying the license in your agent&apos;s metadata and README file. We support the following alternative licenses:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Apache License 2.0:</strong> Includes an explicit patent grant and requires stating changes. A good choice for enterprise-oriented agents.</ListItem>
                <ListItem><strong>GPL v3:</strong> Strong copyleft license requiring derivative works to also be open-source. Suitable when you want to ensure all improvements remain open.</ListItem>
                <ListItem><strong>BSD 3-Clause:</strong> Similar to MIT but includes a non-endorsement clause. Prevents others from using your name to promote their products.</ListItem>
                <ListItem><strong>MPL-2.0:</strong> Weak copyleft (file-level). A middle ground between permissive and copyleft licenses.</ListItem>
              </ul>

              <SubSection>7.3 Proprietary Agent Code</SubSection>
              <Paragraph>
                If you wish to publish an agent with proprietary or custom licensing terms, you may do so with prior approval from the Humain-Uno team. Proprietary agents will be clearly labeled on the marketplace and may be subject to additional review. Contact us at <a href="mailto:licensing@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">licensing@humain-uno.com</a> for more information about proprietary agent listings.
              </Paragraph>

              <SubSection>7.4 License Compatibility</SubSection>
              <Paragraph>
                When combining code from multiple agents or integrating agents with different licenses, it is your responsibility to ensure license compatibility. The MIT License is compatible with most other licenses, but some combinations (e.g., MIT + GPL) may impose additional obligations. We recommend consulting the SPDX License List and using tools like <code className="text-xs bg-muted px-1.5 py-0.5 rounded">licensing</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded">FOSSA</code> for automated compatibility checking.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 8: Contributing Under MIT */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="contributing" icon={Users}>8. Contributing Under MIT</SectionTitle>
              <Paragraph>
                We welcome contributions to the Humain-Uno agent ecosystem. By contributing agent code to the marketplace, you agree to the following terms:
              </Paragraph>

              <SubSection>8.1 Contributor License Agreement</SubSection>
              <Paragraph>
                By submitting agent code to the Humain-Uno marketplace, you represent and warrant that: (a) you are the original author of the code or have the right to submit it under the MIT License; (b) the code does not infringe on any third-party intellectual property rights; (c) you have disclosed any known security vulnerabilities or limitations; and (d) you agree to license your contribution under the MIT License (or your specified alternative license).
              </Paragraph>

              <SubSection>8.2 Corporate Contributions</SubSection>
              <Paragraph>
                If you are contributing on behalf of your employer, you represent that you have the authority to do so. Your employer retains any applicable employer rights in the contribution. We recommend that corporate contributors have a Corporate CLA on file with Humain-Uno before submitting significant contributions.
              </Paragraph>

              <SubSection>8.3 Attribution & Credit</SubSection>
              <Paragraph>
                We believe in giving credit where it is due. All agent submissions include author attribution, and our platform displays contributor information prominently. When you fork or build upon another contributor&apos;s agent, we encourage you to acknowledge the original author in your documentation and provide a link to the original agent.
              </Paragraph>

              <SubSection>8.4 Contributing to Frameworks</SubSection>
              <Paragraph>
                If you wish to contribute improvements to the underlying frameworks (LangGraph, CrewAI, AutoGen, Agno, or LlamaIndex), please refer to each framework&apos;s own contribution guidelines and CLA requirements. Contributions to frameworks are governed by those projects&apos; respective licenses and contribution policies, not by Humain-Uno&apos;s terms.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 9: FAQ */}
            <motion.section {...fadeInUp} viewport={{ once: true }} className="mb-12">
              <SectionTitle id="faq" icon={HelpCircle}>9. Frequently Asked Questions</SectionTitle>

              <div className="space-y-3">
                <FAQItem
                  question="Can I use agent code from the marketplace in my commercial product?"
                  answer="Yes. The MIT License explicitly permits commercial use. You can use, modify, and distribute agent code from the Humain-Uno marketplace in commercial products without paying royalties or licensing fees. The only requirement is that you include the original copyright notice and MIT License text with any substantial portions of the code you distribute."
                />
                <FAQItem
                  question="Do I need to open-source my own code if I use an MIT-licensed agent?"
                  answer="No. The MIT License does not have a copyleft provision. You can use MIT-licensed agent code in proprietary, closed-source projects without any obligation to open-source your own code. This is one of the key differences between the MIT License and licenses like the GPL."
                />
                <FAQItem
                  question="What if I modify an agent from the marketplace?"
                  answer="You are free to modify any MIT-licensed agent code. Your modifications are not required to be open-sourced or shared back with the community. However, if you distribute your modified version, you must still include the original copyright notice and MIT License text. We strongly encourage sharing improvements back with the community through our marketplace."
                />
                <FAQItem
                  question="Can I sublicense agent code from the marketplace?"
                  answer="Yes. The MIT License explicitly grants sublicensing rights. You may incorporate MIT-licensed agent code into your own project and license the combined work under different terms, as long as you comply with the MIT License requirements for the original code (including the copyright notice and license text)."
                />
                <FAQItem
                  question="What happens if I find a security vulnerability in an agent?"
                  answer="We take security seriously. If you discover a security vulnerability in an agent on our marketplace, please report it through our responsible disclosure program at security@humain-uno.com. Do not publicly disclose the vulnerability until we have had a reasonable time to address it. We will work with the agent author to develop and deploy a fix."
                />
                <FAQItem
                  question="How does the MIT License apply to AI-generated code?"
                  answer="AI-generated code on our marketplace is treated the same as human-written code under the MIT License. The agent author who publishes the code is responsible for ensuring they have the right to license it. AI-generated outputs that you create using agents are your own content, subject to our Terms of Service regarding user-generated content."
                />
                <FAQItem
                  question="Can I use the Humain-Uno name or logo to promote my product?"
                  answer="The MIT License does not grant trademark rights. You may not use the Humain-Uno name, logo, or brand to endorse or promote your products without our prior written permission. You may state that your product is compatible with Humain-Uno or built using agents from the Humain-Uno marketplace, as long as you do not imply endorsement."
                />
                <FAQItem
                  question="What if an agent I downloaded has a bug that caused damage?"
                  answer="The MIT License explicitly disclaims all warranties and liability. The software is provided 'AS IS' without warranty of any kind, and the authors are not liable for any damages arising from its use. You assume all risk associated with using agent code. We recommend thoroughly testing all agent code before using it in production environments."
                />
                <FAQItem
                  question="Can I publish my agent under a different license than MIT?"
                  answer="Yes. While MIT is the default license on our marketplace, you may specify an alternative open-source license (Apache 2.0, GPL v3, BSD 3-Clause, MPL-2.0) in your agent's metadata and README. If you need a proprietary license, contact us at licensing@humain-uno.com for approval and setup."
                />
              </div>
            </motion.section>

            {/* Related Pages Footer */}
            <Card className="border bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Related Legal Documents</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Link href="/privacy-policy" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <FileText className="h-4 w-4" />
                    Terms of Service
                  </Link>
                  <a href="mailto:licensing@humain-uno.com" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <Mail className="h-4 w-4" />
                    Licensing Contact
                  </a>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 lg:bottom-6 right-6 z-40"
        >
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-10 w-10 rounded-full shadow-lg bg-muted hover:bg-muted/80"
            size="icon"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
