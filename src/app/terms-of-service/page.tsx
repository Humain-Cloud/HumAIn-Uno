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
  Users,
  Shield,
  Zap,
  AlertTriangle,
  Gavel,
  Key,
  Globe,
  Ban,
  Clock,
  RefreshCw,
  Mail,
  ChevronRight,
  Menu,
  X,
  ArrowUp,
  BookOpen,
  Handshake,
  Building,
} from 'lucide-react'

const LAST_UPDATED = 'March 4, 2026'
const EFFECTIVE_DATE = 'January 15, 2026'

const tocSections = [
  { id: 'acceptance-of-terms', label: 'Acceptance of Terms', icon: Gavel },
  { id: 'description-of-service', label: 'Description of Service', icon: Zap },
  { id: 'user-accounts', label: 'User Accounts & Authentication', icon: Key },
  { id: 'agent-content-ip', label: 'Agent Content & IP', icon: BookOpen },
  { id: 'user-content-license', label: 'User-Generated Content', icon: FileText },
  { id: 'open-source-licensing', label: 'Open Source Licensing', icon: Scale },
  { id: 'acceptable-use', label: 'Acceptable Use Policy', icon: Ban },
  { id: 'api-usage', label: 'API Usage Terms', icon: Zap },
  { id: 'rate-limiting', label: 'Rate Limiting & Fair Use', icon: Clock },
  { id: 'warranty-disclaimer', label: 'Disclaimer of Warranties', icon: AlertTriangle },
  { id: 'limitation-of-liability', label: 'Limitation of Liability', icon: Shield },
  { id: 'indemnification', label: 'Indemnification', icon: Handshake },
  { id: 'termination', label: 'Termination', icon: Ban },
  { id: 'governing-law', label: 'Governing Law', icon: Building },
  { id: 'dispute-resolution', label: 'Dispute Resolution', icon: Gavel },
  { id: 'modifications', label: 'Modifications to Terms', icon: RefreshCw },
  { id: 'contact', label: 'Contact', icon: Mail },
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

export default function TermsOfServicePage() {
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('acceptance-of-terms')
  const [showBackToTop, setShowBackToTop] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-200/20 via-transparent to-transparent dark:from-teal-800/10" />
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
                <BreadcrumbPage>Terms of Service</BreadcrumbPage>
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
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                The terms and conditions governing your use of the Humain-Uno platform
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                  <FileText className="h-3 w-3" />
                  Last Updated: {LAST_UPDATED}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1">
                  Effective: {EFFECTIVE_DATE}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                  <Gavel className="h-3 w-3" />
                  Legally Binding
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
            {/* Important Notice */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Important Notice</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        These Terms of Service constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Humain-Uno, Inc. (&quot;Humain-Uno,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using our AI Agent Marketplace, including our website, web application, API services, and any related services (collectively, the &quot;Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 1: Acceptance of Terms */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="acceptance-of-terms" icon={Gavel}>1. Acceptance of Terms</SectionTitle>
              <Paragraph>
                By creating an account, accessing, or using the Humain-Uno Service, you confirm that you are at least 16 years of age and have the legal capacity to enter into these Terms. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </Paragraph>
              <Paragraph>
                These Terms of Service, together with our <Link href="/privacy-policy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</Link> and <Link href="/license" className="text-emerald-600 dark:text-emerald-400 hover:underline">License</Link> page, constitute the entire agreement between you and Humain-Uno regarding the use of the Service. We may also provide additional terms, policies, or guidelines for specific features or services, which are incorporated by reference into these Terms.
              </Paragraph>
              <Paragraph>
                Your continued use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes. If you do not agree to the modified Terms, you should discontinue use of the Service and close your account.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 2: Description of Service */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="description-of-service" icon={Zap}>2. Description of Service</SectionTitle>
              <Paragraph>
                Humain-Uno provides an AI Agent Marketplace platform that enables users to discover, explore, configure, deploy, and share AI agents. Our Service includes the following core features:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Agent Marketplace:</strong> A curated catalog of 800+ AI agents across 49 categories and 5 frameworks (LangGraph, CrewAI, AutoGen, Agno, LlamaIndex), with search, filtering, and recommendation capabilities</ListItem>
                <ListItem><strong>Knowledge Hub:</strong> A comprehensive knowledge base containing agent project metadata, framework compatibility data, deployment guides, and best practices documentation</ListItem>
                <ListItem><strong>Agent Builder:</strong> Tools for creating, configuring, and customizing AI agents using supported frameworks, including prompt engineering interfaces, tool integration, and testing environments</ListItem>
                <ListItem><strong>API Services:</strong> Programmatic access to the marketplace, agent deployment, and management through our RESTful API</ListItem>
                <ListItem><strong>Community Features:</strong> User profiles, agent reviews, ratings, bookmarking, collections, and social sharing capabilities</ListItem>
              </ul>
              <Paragraph>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, including the availability of any feature, database, or content, with reasonable notice where practicable. We will make commercially reasonable efforts to notify you of material changes to the Service.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 3: User Accounts & Authentication */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="user-accounts" icon={Key}>3. User Accounts & Authentication</SectionTitle>

              <SubSection>3.1 Account Creation</SubSection>
              <Paragraph>
                To access certain features of the Service, you must create an account. When creating an account, you agree to:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Provide accurate, current, and complete information during the registration process</ListItem>
                <ListItem>Maintain and promptly update your account information to keep it accurate, current, and complete</ListItem>
                <ListItem>Maintain the security and confidentiality of your login credentials and accept all risks of unauthorized access</ListItem>
                <ListItem>Immediately notify us at <a href="mailto:security@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">security@humain-uno.com</a> of any unauthorized use of your account or any other breach of security</ListItem>
                <ListItem>Not create accounts using automated means or under false pretenses</ListItem>
              </ul>

              <SubSection>3.2 Authentication Methods</SubSection>
              <Paragraph>
                We support the following authentication methods: email and password (with bcrypt hashing and mandatory 2FA for administrative accounts), OAuth 2.0 single sign-on through Google and GitHub, API key-based authentication for programmatic access, and enterprise SAML 2.0 SSO for team and enterprise plans. You are responsible for all activities that occur under your account, regardless of whether you authorized them.
              </Paragraph>

              <SubSection>3.3 Account Types</SubSection>
              <Paragraph>
                We offer different account tiers with varying levels of access and features: Free (limited API calls, basic marketplace access), Pro (enhanced API limits, priority support, advanced agent features), Team (collaborative workspaces, shared resources, team management), and Enterprise (custom deployments, dedicated support, SLA guarantees, SSO/SAML). Each tier is subject to specific usage limits and pricing as described on our pricing page.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 4: Agent Content & IP */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="agent-content-ip" icon={BookOpen}>4. Agent Content & Intellectual Property</SectionTitle>

              <SubSection>4.1 Humain-Uno Intellectual Property</SubSection>
              <Paragraph>
                The Service and its original content (excluding user-submitted agent code), features, and functionality are and will remain the exclusive property of Humain-Uno, Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks, service marks, and trade dress may not be used in connection with any product or service without the prior written consent of Humain-Uno.
              </Paragraph>

              <SubSection>4.2 Agent Code Ownership</SubSection>
              <Paragraph>
                Agent code submitted to the marketplace remains the intellectual property of its original creator(s). By submitting agent code to the marketplace, you represent and warrant that you have the right to license that code under the MIT License (or another license you specify). You retain ownership of your agent code, subject to the licensing grant described in Section 5.
              </Paragraph>

              <SubSection>4.3 Knowledge Base Content</SubSection>
              <Paragraph>
                The curated metadata, categorizations, compatibility data, and editorial content within our Knowledge Base are the property of Humain-Uno. This includes our framework compatibility analysis, quality assessments, and curated collections. You may not reproduce, distribute, or create derivative works from our curated knowledge base content without written permission, except as permitted under the fair use doctrine.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 5: User-Generated Content License */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="user-content-license" icon={FileText}>5. User-Generated Content License</SectionTitle>
              <Paragraph>
                Our Service allows you to create, submit, post, display, transmit, or distribute content, including but not limited to agent code, configurations, prompts, documentation, reviews, and comments (&quot;User Content&quot;). You retain all rights in, and are solely responsible for, the User Content you post to the Service.
              </Paragraph>
              <Paragraph>
                By posting User Content on or through the Service, you grant us a non-exclusive, worldwide, royalty-free, fully paid-up license to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content solely for the purpose of operating, promoting, and improving the Service. This license persists for as long as your User Content remains on the Service, and you may revoke it by deleting your User Content, subject to the following limitations:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Agent code submitted to the marketplace is licensed under the MIT License by default, as described in Section 6</ListItem>
                <ListItem>Reviews, comments, and community contributions may be retained in anonymized form for service improvement</ListItem>
                <ListItem>Agent deployment metrics and usage data may be retained in aggregate form and are not subject to deletion</ListItem>
                <ListItem>We are not liable for any loss or damage resulting from your submission of User Content</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 6: Open Source Licensing */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="open-source-licensing" icon={Scale}>6. Open Source Licensing (MIT License)</SectionTitle>
              <Paragraph>
                All agent code published on the Humain-Uno marketplace is licensed under the MIT License unless explicitly stated otherwise by the agent author. The MIT License is one of the most permissive open-source licenses and allows for broad use, modification, and distribution:
              </Paragraph>

              <Card className="border mb-6 bg-muted/30">
                <CardContent className="p-6">
                  <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                    Copyright (c) [year] [agent author]<br /><br />
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br /><br />
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br /><br />
                    THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </p>
                </CardContent>
              </Card>

              <Paragraph>
                By submitting agent code to the marketplace, you agree to license it under the MIT License. If you wish to use a different license, you must clearly indicate this in your agent&apos;s README and metadata. For more details, see our <Link href="/license" className="text-emerald-600 dark:text-emerald-400 hover:underline">License page</Link>.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 7: Acceptable Use Policy */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="acceptable-use" icon={Ban}>7. Acceptable Use Policy</SectionTitle>
              <Paragraph>
                You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. The following activities are strictly prohibited:
              </Paragraph>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {[
                  { title: 'Illegal Activities', desc: 'Using the Service for any purpose that violates applicable local, state, national, or international law or regulation' },
                  { title: 'Harmful Content', desc: 'Creating agents that generate malware, phishing content, deepfakes, or content that promotes violence, hate, or discrimination' },
                  { title: 'Data Harvesting', desc: 'Using agents to scrape, harvest, or collect personal information of others without consent, or in violation of privacy laws' },
                  { title: 'Service Abuse', desc: 'Attempting to circumvent rate limits, access controls, or security measures; or using the Service to attack other systems' },
                  { title: 'Impersonation', desc: 'Misrepresenting your identity or affiliation, or creating agents that impersonate real individuals without authorization' },
                  { title: 'IP Infringement', desc: 'Submitting agent code that infringes on the intellectual property rights of others, including patents, copyrights, or trade secrets' },
                ].map((item) => (
                  <Card key={item.title} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Ban className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Paragraph>
                We reserve the right to remove any content, suspend or terminate accounts, and report violations to appropriate legal authorities when we become aware of prohibited activities. We may implement automated detection systems to identify and prevent abuse of the Service.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 8: API Usage Terms */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="api-usage" icon={Zap}>8. API Usage Terms</SectionTitle>
              <Paragraph>
                Access to the Humain-Uno API is provided subject to the following terms and conditions:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>API Keys:</strong> You will be assigned unique API credentials that must be kept confidential. You are responsible for all API usage under your credentials, including unauthorized use. You must notify us immediately of any suspected credential compromise.</ListItem>
                <ListItem><strong>Permitted Use:</strong> The API may only be used to access your own account data, deploy agents within your authorized workspaces, and retrieve public marketplace data. Reverse engineering, decompiling, or attempting to extract the source code of the API is strictly prohibited.</ListItem>
                <ListItem><strong>Data Handling:</strong> Data retrieved through the API is subject to the same terms as data accessed through the web interface. You must not cache, store, or redistribute API response data beyond what is reasonably necessary for your application&apos;s functionality.</ListItem>
                <ListItem><strong>API Changes:</strong> We may update, modify, or discontinue API endpoints with 90 days&apos; notice for breaking changes. Non-breaking changes (additions of new fields) may be deployed without notice. We will maintain versioned API endpoints to minimize disruption.</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 9: Rate Limiting */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="rate-limiting" icon={Clock}>9. Rate Limiting & Fair Use</SectionTitle>
              <Paragraph>
                To ensure the stability and availability of our Service for all users, we implement rate limiting on API requests and certain high-resource operations:
              </Paragraph>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Plan</th>
                      <th className="text-left py-3 px-4 font-semibold">API Calls/Minute</th>
                      <th className="text-left py-3 px-4 font-semibold">Agent Deploys/Day</th>
                      <th className="text-left py-3 px-4 font-semibold">Storage</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4">Free</td>
                      <td className="py-3 px-4">60</td>
                      <td className="py-3 px-4">5</td>
                      <td className="py-3 px-4">100 MB</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Pro</td>
                      <td className="py-3 px-4">600</td>
                      <td className="py-3 px-4">100</td>
                      <td className="py-3 px-4">10 GB</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Team</td>
                      <td className="py-3 px-4">2,000</td>
                      <td className="py-3 px-4">Unlimited</td>
                      <td className="py-3 px-4">100 GB</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Enterprise</td>
                      <td className="py-3 px-4">Custom</td>
                      <td className="py-3 px-4">Unlimited</td>
                      <td className="py-3 px-4">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Paragraph>
                When rate limits are exceeded, the API will return HTTP 429 (Too Many Requests) with a Retry-After header. Repeated or systematic rate limit violations may result in temporary or permanent API access restrictions. We employ fair use policies to ensure no single user or application disproportionately consumes shared resources.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 10: Disclaimer of Warranties */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="warranty-disclaimer" icon={AlertTriangle}>10. Disclaimer of Warranties</SectionTitle>

              <Card className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">IMPORTANT:</strong> AI-generated content may contain errors, biases, or inaccuracies. Always verify AI agent outputs before relying on them for critical decisions. Do not use AI agents as a substitute for professional advice in medical, legal, financial, or safety-critical applications.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Paragraph>
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY LAW, HUMAIN-UNO DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</ListItem>
                <ListItem>Warranties that the Service will be uninterrupted, timely, secure, or error-free</ListItem>
                <ListItem>Warranties that the results obtained from the use of the Service will be accurate, reliable, or complete</ListItem>
                <ListItem>Warranties that the Service will meet your specific requirements or expectations</ListItem>
                <ListItem>Warranties regarding the accuracy, reliability, or safety of AI agent outputs, including but not limited to code generation, text generation, and decision-making assistance</ListItem>
              </ul>
              <Paragraph>
                AI agents available on the marketplace are community-contributed projects and their outputs are generated by artificial intelligence systems. These outputs may contain errors, exhibit biases present in training data, or produce unexpected results. You acknowledge and agree that you are solely responsible for evaluating the accuracy, appropriateness, and safety of any AI agent outputs before using, relying on, or distributing them.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 11: Limitation of Liability */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="limitation-of-liability" icon={Shield}>11. Limitation of Liability</SectionTitle>
              <Paragraph>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HUMAIN-UNO, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Loss of profits, data, use, goodwill, or other intangible losses</ListItem>
                <ListItem>Damages resulting from unauthorized access to or use of our servers or any personal information stored therein</ListItem>
                <ListItem>Damages resulting from any interruption or cessation of transmission to or from the Service</ListItem>
                <ListItem>Damages resulting from any bugs, viruses, or similar harmful code that may be transmitted through the Service</ListItem>
                <ListItem>Damages resulting from errors or inaccuracies in AI agent outputs, including any decisions made or actions taken based on such outputs</ListItem>
                <ListItem>Damages resulting from your use of any content obtained through the Service</ListItem>
              </ul>
              <Paragraph>
                This limitation of liability applies regardless of the legal theory under which such damages are sought, whether based on warranty, contract, tort (including negligence), strict liability, or any other legal theory, and whether or not Humain-Uno has been advised of the possibility of such damages. In no event shall our total liability to you for all claims arising out of or relating to the Service exceed the amount you paid to Humain-Uno in the twelve (12) months preceding the event giving rise to the claim, or one hundred US dollars ($100), whichever is greater.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 12: Indemnification */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="indemnification" icon={Handshake}>12. Indemnification</SectionTitle>
              <Paragraph>
                You agree to defend, indemnify, and hold harmless Humain-Uno, its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt arising from:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Your use of, or inability to use, the Service</ListItem>
                <ListItem>Your violation of any term of these Terms of Service</ListItem>
                <ListItem>Your violation of any third-party right, including without limitation any copyright, patent, trademark, trade secret, or other intellectual property right, or privacy right</ListItem>
                <ListItem>Your submission of agent code or other content that infringes on the rights of any third party</ListItem>
                <ListItem>Any harm caused by AI agents you create, deploy, or distribute through the Service</ListItem>
                <ListItem>Any unauthorized access to your account or use of your API credentials</ListItem>
              </ul>
              <Paragraph>
                Humain-Uno reserves the right, at its own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, and in such case, you agree to cooperate with Humain-Uno&apos;s defense of such claim.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 13: Termination */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="termination" icon={Ban}>13. Termination</SectionTitle>
              <Paragraph>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms, with or without notice.
              </Paragraph>

              <SubSection>13.1 Termination by You</SubSection>
              <Paragraph>
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the Service will immediately cease. Agent code you have published under the MIT License will remain available on the marketplace unless you request removal, subject to the rights already granted to users who have downloaded or forked your agents.
              </Paragraph>

              <SubSection>13.2 Termination by Us</SubSection>
              <Paragraph>
                We may terminate or suspend your access to the Service for cause, including: (a) violation of these Terms, (b) fraudulent or abusive activity, (c) failure to pay applicable fees, or (d) prolonged inactivity (12+ months for free accounts). We will provide 30 days&apos; written notice for terminations without cause, except where immediate termination is required for security or legal reasons.
              </Paragraph>

              <SubSection>13.3 Effect of Termination</SubSection>
              <Paragraph>
                Upon termination, all provisions of these Terms that by their nature should survive termination shall survive, including without limitation: ownership provisions, warranty disclaimers, indemnification clauses, limitations of liability, and dispute resolution provisions. We will retain your data for 90 days following termination, after which it will be permanently deleted, except where retention is required by law.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 14: Governing Law */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="governing-law" icon={Building}>14. Governing Law</SectionTitle>
              <Paragraph>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. You agree that any legal suit, action, or proceeding arising out of or related to these Terms or the Service shall be instituted exclusively in the federal courts of the United States or the courts of the State of California, in each case located in San Francisco County, California.
              </Paragraph>
              <Paragraph>
                For users located in the European Union, nothing in these Terms shall limit any mandatory consumer protection rights you may have under local law. If you are a consumer residing in the EU, you may also bring proceedings in the courts of your country of residence.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 15: Dispute Resolution */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="dispute-resolution" icon={Gavel}>15. Dispute Resolution</SectionTitle>

              <SubSection>15.1 Informal Resolution</SubSection>
              <Paragraph>
                Before filing any formal legal claim, you agree to first contact us at <a href="mailto:legal@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">legal@humain-uno.com</a> and attempt to resolve the dispute informally. We will attempt to resolve the dispute within 60 days of receiving your notice. If the dispute is not resolved within 60 days, either party may proceed with formal dispute resolution.
              </Paragraph>

              <SubSection>15.2 Binding Arbitration</SubSection>
              <Paragraph>
                Any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this agreement to arbitrate, shall be determined by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its Commercial Arbitration Rules. The arbitration shall be conducted in San Francisco, California, or at another mutually agreed location, and may be conducted remotely via video conference.
              </Paragraph>

              <SubSection>15.3 Class Action Waiver</SubSection>
              <Paragraph>
                You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You waive any right to participate in a class action lawsuit or class-wide arbitration against Humain-Uno. The arbitrator may not consolidate more than one person&apos;s claims, and may not otherwise preside over any form of a representative or class proceeding.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 16: Modifications */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="modifications" icon={RefreshCw}>16. Modifications to These Terms</SectionTitle>
              <Paragraph>
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect by posting the updated Terms on our website and sending an email notification to your registered email address. What constitutes a material change will be determined at our sole discretion, in good faith, and using common sense and reasonable judgment.
              </Paragraph>
              <Paragraph>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service and should close your account.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 17: Contact */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="contact" icon={Mail}>17. Contact</SectionTitle>
              <Paragraph>
                If you have any questions about these Terms of Service, please contact us:
              </Paragraph>

              <Card className="border mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Legal Department</h4>
                      <p className="text-sm text-muted-foreground">Humain-Uno, Inc.</p>
                      <p className="text-sm text-muted-foreground">Email: <a href="mailto:legal@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">legal@humain-uno.com</a></p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Mailing Address</h4>
                      <p className="text-sm text-muted-foreground">Humain-Uno, Inc.</p>
                      <p className="text-sm text-muted-foreground">Attn: Legal Department</p>
                      <p className="text-sm text-muted-foreground">535 Mission Street, Suite 1400</p>
                      <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">DMCA & Copyright Notices</h4>
                      <p className="text-sm text-muted-foreground">Email: <a href="mailto:copyright@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">copyright@humain-uno.com</a></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <Link href="/license" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <FileText className="h-4 w-4" />
                    MIT License
                  </Link>
                  <a href="mailto:legal@humain-uno.com" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <Mail className="h-4 w-4" />
                    Contact Legal
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
