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
  Shield,
  Lock,
  Eye,
  Database,
  Server,
  Globe,
  Users,
  Cookie,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Mail,
  ChevronRight,
  Menu,
  X,
  ArrowUp,
} from 'lucide-react'

const LAST_UPDATED = 'March 4, 2026'
const EFFECTIVE_DATE = 'January 15, 2026'

const tocSections = [
  { id: 'information-we-collect', label: 'Information We Collect', icon: Database },
  { id: 'how-we-use', label: 'How We Use Information', icon: Eye },
  { id: 'ai-data-processing', label: 'AI Agent Data Processing', icon: Server },
  { id: 'knowledge-base-data', label: 'Knowledge Base Data', icon: Database },
  { id: 'third-party-services', label: 'Third-Party Services', icon: Globe },
  { id: 'data-security', label: 'Data Security & Encryption', icon: Lock },
  { id: 'user-rights', label: 'Your Rights', icon: CheckCircle2 },
  { id: 'international-transfers', label: 'International Data Transfers', icon: Globe },
  { id: 'cookies-tracking', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'childrens-privacy', label: "Children's Privacy", icon: Users },
  { id: 'changes-to-policy', label: 'Changes to This Policy', icon: FileText },
  { id: 'contact-information', label: 'Contact Information', icon: Mail },
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

export default function PrivacyPolicyPage() {
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('information-we-collect')
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent dark:from-emerald-800/10" />
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
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
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
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                How Humain-Uno collects, uses, and protects your personal information
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
                  <CheckCircle2 className="h-3 w-3" />
                  GDPR Compliant
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex gap-8">
          {/* Desktop Table of Contents Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" />
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-10">
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        At Humain-Uno, Inc. (&quot;Humain-Uno,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our AI Agent Marketplace platform, including our website, web application, API services, and any related services (collectively, the &quot;Service&quot;). By using the Service, you agree to the collection and use of information in accordance with this policy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 1: Information We Collect */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="information-we-collect" icon={Database}>1. Information We Collect</SectionTitle>
              <Paragraph>
                We collect several types of information to provide, maintain, and improve our AI Agent Marketplace, ensure security, and deliver a personalized experience. The information we collect falls into the following categories:
              </Paragraph>

              <SubSection>1.1 Personal Information</SubSection>
              <Paragraph>
                When you create an account or interact with our Service, we may collect personally identifiable information, including:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Your name, email address, and profile picture</ListItem>
                <ListItem>Account credentials (passwords stored using bcrypt hashing with salt rounds of 12)</ListItem>
                <ListItem>Organization or company affiliation and role</ListItem>
                <ListItem>Billing and payment information (processed through secure third-party payment processors; we do not store full credit card numbers on our servers)</ListItem>
                <ListItem>Communication preferences and contact details for support inquiries</ListItem>
              </ul>

              <SubSection>1.2 Usage Data</SubSection>
              <Paragraph>
                We automatically collect certain information when you access or use our Service, including:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Device information (browser type, operating system, screen resolution, device identifiers)</ListItem>
                <ListItem>IP address and approximate geographic location derived from IP geolocation databases</ListItem>
                <ListItem>Pages viewed, features used, and navigation patterns within the marketplace</ListItem>
                <ListItem>Search queries, filter selections, and agent interactions within the knowledge base</ListItem>
                <ListItem>Time zone, language preferences, and accessibility settings</ListItem>
                <ListItem>Referral source, landing pages, and exit pages</ListItem>
                <ListItem>Session duration and interaction timestamps</ListItem>
              </ul>

              <SubSection>1.3 Cookies and Tracking Technologies</SubSection>
              <Paragraph>
                We use cookies, web beacons, pixel tags, and similar tracking technologies to collect and store information about your interactions with our Service. We use the following types of cookies:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Essential Cookies:</strong> Required for the Service to function properly, including session authentication, CSRF protection, and load balancing. These cannot be disabled.</ListItem>
                <ListItem><strong>Functional Cookies:</strong> Remember your preferences, such as theme settings (dark/light mode), language selection, and layout preferences. These enhance your experience but are not strictly necessary.</ListItem>
                <ListItem><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Service, using tools such as anonymized page view tracking, heatmaps, and session recordings (with IP anonymization enabled).</ListItem>
                <ListItem><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and measure the effectiveness of our marketing campaigns. These are only set with your explicit consent.</ListItem>
              </ul>

              <SubSection>1.4 AI Interaction Data</SubSection>
              <Paragraph>
                As an AI Agent Marketplace, we collect specific data related to your interactions with AI agents, including:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Agent configuration parameters, system prompts, and customization settings you provide</ListItem>
                <ListItem>Prompts, instructions, and input data you submit to agents during interactions</ListItem>
                <ListItem>Agent outputs, responses, and generated content from conversations</ListItem>
                <ListItem>Feedback ratings, thumbs-up/down, and usage patterns for specific agents</ListItem>
                <ListItem>Framework-specific configuration data (LangGraph state graphs, CrewAI crew definitions, AutoGen conversation patterns, Agno agent configs, LlamaIndex index settings)</ListItem>
                <ListItem>Agent deployment logs, execution traces, and performance metrics</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 2: How We Use Information */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="how-we-use" icon={Eye}>2. How We Use Your Information</SectionTitle>
              <Paragraph>
                We use the information we collect for a variety of purposes to provide, improve, and secure our Service:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Service Delivery:</strong> To provide, maintain, and operate the AI Agent Marketplace, including agent discovery, configuration, deployment, and management features</ListItem>
                <ListItem><strong>Account Management:</strong> To create and manage your account, authenticate your identity, process password resets, and provide customer support</ListItem>
                <ListItem><strong>Personalization:</strong> To personalize your experience, including agent recommendations, curated search results, and tailored content based on your usage history and preferences</ListItem>
                <ListItem><strong>Communication:</strong> To send you technical notices, product updates, security alerts, and support messages, as well as marketing communications where you have opted in</ListItem>
                <ListItem><strong>Analytics & Improvement:</strong> To monitor and analyze usage patterns, trending agents, and performance metrics to improve our Service and develop new features</ListItem>
                <ListItem><strong>Security & Fraud Prevention:</strong> To detect, prevent, and address technical issues, fraud, security breaches, unauthorized access, and potentially prohibited or illegal activities</ListItem>
                <ListItem><strong>Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests</ListItem>
                <ListItem><strong>Knowledge Base Curation:</strong> To maintain and improve our 800+ agent knowledge base, ensuring accurate metadata, proper categorization, framework compatibility, and quality standards</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 3: AI Agent Data Processing */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="ai-data-processing" icon={Server}>3. AI Agent Data Processing</SectionTitle>
              <Paragraph>
                Humain-Uno operates an AI Agent Marketplace where users can discover, configure, deploy, and share AI agents built on various frameworks. The processing of data in this context involves specific considerations that are important for you to understand:
              </Paragraph>

              <SubSection>3.1 Agent Interaction Processing</SubSection>
              <Paragraph>
                When you interact with AI agents on our platform, your input data (prompts, configurations, files) is processed to generate responses. This processing occurs on our secure infrastructure and, where applicable, through our trusted framework partners&apos; runtime environments. We implement the following safeguards for all agent interactions:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>All agent input/output data is encrypted in transit using TLS 1.3 with forward secrecy</ListItem>
                <ListItem>Agent execution environments are sandboxed and isolated per user session with resource limits</ListItem>
                <ListItem>We do not use your agent interaction data to train third-party AI models without your explicit, informed consent</ListItem>
                <ListItem>Agent conversation histories are stored with encryption at rest and are accessible only to the account holder</ListItem>
                <ListItem>Agent execution logs are automatically purged after 30 days unless retained for debugging with your consent</ListItem>
              </ul>

              <SubSection>3.2 Data Retention for Agent Operations</SubSection>
              <Paragraph>
                Agent interaction data is retained based on your account settings and the specific agent configuration. By default, conversation histories are retained for 90 days, after which they are automatically and permanently purged unless you choose to archive them. Agent configuration data and deployment settings are retained for the lifetime of your account unless you choose to delete them. Archived conversations are stored with enhanced encryption and can be exported at any time.
              </Paragraph>

              <SubSection>3.3 Framework-Specific Processing</SubSection>
              <Paragraph>
                Our marketplace supports multiple AI agent frameworks, each with its own data processing characteristics. When you deploy agents using these frameworks, be aware that:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>LangGraph:</strong> Agent state graphs and execution traces are stored within our infrastructure. LangChain&apos;s services may process graph topology data for orchestration. State data is encrypted per workspace.</ListItem>
                <ListItem><strong>CrewAI:</strong> Crew role definitions, task delegation data, and agent collaboration patterns are processed locally within your session. Multi-agent communication logs may be stored for debugging with your permission.</ListItem>
                <ListItem><strong>AutoGen:</strong> Multi-agent conversation logs and message exchange patterns are stored in your workspace. Microsoft&apos;s AutoGen runtime processes message exchanges for agent coordination.</ListItem>
                <ListItem><strong>Agno:</strong> Agent configuration schemas, tool definitions, and knowledge base queries are processed within our secure environment. No data is shared with third parties.</ListItem>
                <ListItem><strong>LlamaIndex:</strong> Index structures, document embeddings, and retrieval queries are processed in our infrastructure. Document embeddings are stored in your designated vector store with encryption at rest.</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 4: Knowledge Base Data */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="knowledge-base-data" icon={Database}>4. Knowledge Base Data</SectionTitle>
              <Paragraph>
                Humain-Uno maintains a curated knowledge base of over 800 AI agent projects across 49 categories and 5 frameworks. This section describes how we handle the data within our knowledge base and the processes we use to ensure its accuracy and quality:
              </Paragraph>

              <SubSection>4.1 Agent Project Metadata</SubSection>
              <Paragraph>
                Our knowledge base contains metadata for each agent project, including names, descriptions, categories, framework compatibility, author information, license types, star ratings, usage statistics, and deployment instructions. This metadata is collected through:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Direct submissions from agent developers and authors through our submission portal</ListItem>
                <ListItem>Automated indexing of public open-source repositories that have been explicitly tagged for our platform</ListItem>
                <ListItem>Community contributions, peer reviews, and collaborative editing by verified contributors</ListItem>
                <ListItem>Our internal curation team&apos;s research, validation, and quality assurance processes</ListItem>
              </ul>

              <SubSection>4.2 Curation Process</SubSection>
              <Paragraph>
                Our curation process involves both automated and manual review to ensure quality, security, and accuracy. We employ automated scanning for security vulnerabilities (including dependency vulnerability analysis), license compliance checks using SPDX identifiers, and dependency tree validation. Our editorial team reviews each agent submission for code quality, documentation completeness, adherence to community standards, and proper categorization. We do not modify the original agent code but may enrich metadata with additional categorization, tags, compatibility information, and verified test results.
              </Paragraph>

              <SubSection>4.3 Knowledge Base Usage Analytics</SubSection>
              <Paragraph>
                We track how users interact with the knowledge base to improve discoverability and relevance of agents. This includes search queries, click-through rates, bookmark actions, star ratings, deployment statistics, and comparison tool usage. These analytics are aggregated and anonymized before being used for product improvement purposes. Individual-level analytics are never shared with third parties without explicit consent.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 5: Third-Party Services */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="third-party-services" icon={Globe}>5. Third-Party Services</SectionTitle>
              <Paragraph>
                We integrate with and rely on several third-party services to operate our platform. Each third-party service has its own privacy practices, and we encourage you to review their policies. Key third-party integrations include:
              </Paragraph>

              <SubSection>5.1 AI Agent Frameworks</SubSection>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {[
                  { name: 'LangGraph', desc: 'Graph-based agent orchestration by LangChain. Processes agent state graphs and execution traces for multi-step reasoning workflows.', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
                  { name: 'CrewAI', desc: 'Multi-agent collaboration framework. Handles crew role definitions, task delegation, and inter-agent communication protocols.', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
                  { name: 'AutoGen', desc: 'Microsoft\'s multi-agent conversation framework. Processes multi-agent message exchanges and conversation orchestration.', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
                  { name: 'Agno', desc: 'Lightweight agent framework for building production AI agents. Processes agent configurations and knowledge queries.', badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
                  { name: 'LlamaIndex', desc: 'Data framework for LLM applications. Processes indexing structures, document embeddings, and retrieval queries.', badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
                ].map((fw) => (
                  <Card key={fw.name} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${fw.badgeClass} border-0 text-xs`}>
                          {fw.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{fw.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <SubSection>5.2 Other Third-Party Services</SubSection>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Cloud Infrastructure:</strong> We use SOC 2 Type II certified cloud hosting providers for application hosting, data storage, and compute resources with geographic redundancy</ListItem>
                <ListItem><strong>Authentication:</strong> We use OAuth 2.0 providers (Google, GitHub) for single sign-on; these providers may share basic profile information such as name, email, and avatar</ListItem>
                <ListItem><strong>Analytics:</strong> We use privacy-focused analytics tools that do not sell your data and comply with GDPR and CCPA requirements</ListItem>
                <ListItem><strong>Payment Processing:</strong> Payment data is handled by PCI DSS Level 1 compliant payment processors; we never store full credit card numbers on our servers</ListItem>
                <ListItem><strong>Communication:</strong> Email and notification services for transactional communications (password resets, security alerts) and optional marketing communications</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 6: Data Security */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="data-security" icon={Lock}>6. Data Security & Encryption</SectionTitle>
              <Paragraph>
                We implement industry-standard security measures to protect your personal information and AI interaction data. Our security practices are regularly audited and updated to address emerging threats:
              </Paragraph>

              <SubSection>6.1 Encryption</SubSection>
              <ul className="ml-2 mb-6">
                <ListItem><strong>In Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.3 with strong cipher suites. We enforce HSTS with a minimum TLS version of 1.2.</ListItem>
                <ListItem><strong>At Rest:</strong> Personal data and agent interaction logs are encrypted at rest using AES-256 encryption with separate encryption keys per data category</ListItem>
                <ListItem><strong>End-to-End:</strong> Sensitive agent conversations and proprietary agent configurations support optional end-to-end encryption where only you hold the decryption keys</ListItem>
                <ListItem><strong>Key Management:</strong> Encryption keys are managed through FIPS 140-2 Level 3 certified hardware security modules (HSMs) with automated 90-day rotation schedules</ListItem>
              </ul>

              <SubSection>6.2 Access Controls</SubSection>
              <ul className="ml-2 mb-6">
                <ListItem>Role-based access control (RBAC) with the principle of least privilege enforced across all systems</ListItem>
                <ListItem>Multi-factor authentication (MFA) required for all administrative and privileged access</ListItem>
                <ListItem>Regular access audits and automated de-provisioning for departed team members within 24 hours</ListItem>
                <ListItem>All administrative actions are logged in an immutable audit trail with 12-month retention</ListItem>
                <ListItem>Zero-trust network architecture with micro-segmentation for agent execution environments</ListItem>
              </ul>

              <SubSection>6.3 Compliance & Certifications</SubSection>
              <Paragraph>
                We maintain compliance with major security and privacy standards and undergo regular third-party audits. Our certifications and compliance frameworks include SOC 2 Type II, ISO 27001:2022, GDPR (EU General Data Protection Regulation), CCPA (California Consumer Privacy Act), HIPAA (for healthcare-related agent deployments), and the EU AI Act for AI system transparency and accountability requirements. We conduct annual penetration testing by independent security firms and maintain a responsible disclosure program for security researchers.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 7: User Rights */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="user-rights" icon={CheckCircle2}>7. Your Rights</SectionTitle>
              <Paragraph>
                Depending on your jurisdiction, you may have certain rights regarding your personal information. We are committed to honoring these rights and providing clear mechanisms for you to exercise them:
              </Paragraph>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {[
                  { title: 'Right of Access', desc: 'You can request a copy of the personal data we hold about you, including AI interaction data, account information, and usage history. We provide this in a machine-readable format within 30 days.', icon: Eye },
                  { title: 'Right to Correction', desc: 'You can request that we correct any inaccurate or incomplete personal information we hold about you. Most corrections can be made directly through your account settings.', icon: FileText },
                  { title: 'Right to Deletion', desc: 'You can request deletion of your personal data, subject to legal retention requirements. Agent data is permanently removed within 30 days of a verified deletion request.', icon: AlertTriangle },
                  { title: 'Right to Portability', desc: 'You can request your data in a machine-readable format (JSON, CSV), including agent configurations, conversation histories, and account data for transfer to another service.', icon: Database },
                  { title: 'Right to Object', desc: 'You can object to the processing of your personal data for specific purposes, including direct marketing, profiling, and automated decision-making.', icon: Shield },
                  { title: 'Right to Restrict', desc: 'You can request that we limit the processing of your personal data in certain circumstances, such as pending accuracy disputes or legal claims.', icon: Lock },
                ].map((right) => {
                  const RIcon = right.icon
                  return (
                    <Card key={right.title} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <RIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{right.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{right.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Paragraph>
                To exercise any of these rights, please contact us at <a href="mailto:privacy@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">privacy@humain-uno.com</a>. We will respond to your request within 30 days, or within the timeframe required by applicable law. We may need to verify your identity before processing your request. You also have the right to lodge a complaint with your local data protection authority if you are unsatisfied with our response.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 8: International Data Transfers */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="international-transfers" icon={Globe}>8. International Data Transfers</SectionTitle>
              <Paragraph>
                Humain-Uno operates globally, and your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from your jurisdiction. When we transfer your data internationally, we ensure appropriate safeguards are in place:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem><strong>Standard Contractual Clauses (SCCs):</strong> We use EU-approved Standard Contractual Clauses for transfers from the European Economic Area (EEA) to countries without an adequacy decision, ensuring equivalent levels of protection</ListItem>
                <ListItem><strong>Adequacy Decisions:</strong> Where available, we rely on adequacy decisions from the European Commission confirming that a country provides an adequate level of data protection</ListItem>
                <ListItem><strong>Binding Corporate Rules:</strong> For intra-group transfers within the Humain-Uno organization, we maintain binding corporate rules approved by relevant data protection authorities</ListItem>
                <ListItem><strong>Data Localization Options:</strong> Enterprise and team customers can select data residency options to ensure their data remains within specific geographic regions (US, EU, APAC)</ListItem>
                <ListItem><strong>Transfer Impact Assessments:</strong> We conduct regular transfer impact assessments for all cross-border data flows to ensure ongoing compliance with Schrems II requirements</ListItem>
              </ul>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 9: Cookies & Tracking */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="cookies-tracking" icon={Cookie}>9. Cookies & Tracking Technologies</SectionTitle>
              <Paragraph>
                Our use of cookies and tracking technologies is designed to be transparent and respectful of your privacy choices. You can manage your cookie preferences at any time through our cookie consent tool, accessible from the footer of our website or from your account settings.
              </Paragraph>

              <SubSection>9.1 Managing Cookies</SubSection>
              <Paragraph>
                You can control cookies through your browser settings and our preference center. You may block or delete cookies, opt out of specific cookie categories, or set your browser to notify you when cookies are being set. Note that disabling certain cookies (particularly essential and functional cookies) may affect the functionality of our Service and limit your ability to use certain features.
              </Paragraph>

              <SubSection>9.2 Do Not Track</SubSection>
              <Paragraph>
                We honor Do Not Track (DNT) browser signals where required by law. When we detect a DNT signal, we limit our data collection to essential operational data and do not engage in cross-site tracking or personalized advertising. Some third-party services on our platform may not fully support DNT signals, and we encourage you to review their privacy policies.
              </Paragraph>

              <SubSection>9.3 Pixel Tags & Web Beacons</SubSection>
              <Paragraph>
                We may use pixel tags (also known as web beacons or clear GIFs) in our emails to track open rates and click-through rates for transactional and marketing emails. This helps us improve our communications. You can disable this tracking by adjusting your email notification preferences or by disabling image loading in your email client.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 10: Children's Privacy */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="childrens-privacy" icon={Users}>10. Children&apos;s Privacy</SectionTitle>
              <Paragraph>
                Our Service is not directed at individuals under the age of 16. We do not knowingly collect personal information from children under 16 years of age. If you are a parent or guardian and become aware that your child has provided us with personal information, please contact us immediately at <a href="mailto:privacy@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">privacy@humain-uno.com</a>. We will take steps to promptly delete such information from our systems and confirm the deletion in writing.
              </Paragraph>
              <Paragraph>
                If we discover that we have collected personal information from a child under 16 without verification of parental consent, we will delete that information as quickly as commercially feasible and within 10 business days. We implement age-gating mechanisms in our registration process to prevent unauthorized access by minors, and we require age verification for access to certain features of our platform.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 11: Changes to Policy */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="changes-to-policy" icon={FileText}>11. Changes to This Privacy Policy</SectionTitle>
              <Paragraph>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes to this Privacy Policy, we will:
              </Paragraph>
              <ul className="ml-2 mb-6">
                <ListItem>Post the updated Privacy Policy on our website with a revised &quot;Last Updated&quot; date at the top of this page</ListItem>
                <ListItem>Notify you via email (for material changes) at least 30 days before the changes take effect, sent to your registered email address</ListItem>
                <ListItem>Display a prominent banner notice on our platform when you next log in after changes have been posted</ListItem>
                <ListItem>Obtain your explicit consent where required by applicable law before implementing changes that materially affect how we process your personal data</ListItem>
                <ListItem>Maintain a version history of all Privacy Policy changes accessible upon request</ListItem>
              </ul>
              <Paragraph>
                We encourage you to periodically review this Privacy Policy to stay informed about how we protect your information. Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated terms.
              </Paragraph>
            </motion.section>

            <Separator className="mb-12" />

            {/* Section 12: Contact Information */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
              <SectionTitle id="contact-information" icon={Mail}>12. Contact Information</SectionTitle>
              <Paragraph>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the following channels:
              </Paragraph>

              <Card className="border mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Data Protection Officer</h4>
                      <p className="text-sm text-muted-foreground">Humain-Uno, Inc.</p>
                      <p className="text-sm text-muted-foreground">Email: <a href="mailto:privacy@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">privacy@humain-uno.com</a></p>
                      <p className="text-sm text-muted-foreground">Response time: Within 30 days of receipt</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Mailing Address</h4>
                      <p className="text-sm text-muted-foreground">Humain-Uno, Inc.</p>
                      <p className="text-sm text-muted-foreground">Attn: Privacy & Data Protection Team</p>
                      <p className="text-sm text-muted-foreground">535 Mission Street, Suite 1400</p>
                      <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                      <p className="text-sm text-muted-foreground">United States</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">European Representative (GDPR)</h4>
                      <p className="text-sm text-muted-foreground">For EU/EEA data subjects, you may also contact our European representative:</p>
                      <p className="text-sm text-muted-foreground">Email: <a href="mailto:eu-privacy@humain-uno.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">eu-privacy@humain-uno.com</a></p>
                      <p className="text-sm text-muted-foreground">Address: Humain-Uno EU, Grand Canal Dock, Dublin 2, Ireland</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Paragraph>
                If you are not satisfied with our response to a privacy concern or data rights request, you have the right to lodge a complaint with your local data protection authority. In the European Union, you can contact the supervisory authority in your EU member state. In the United States, you may contact the relevant state attorney general&apos;s office. In California, you may contact the California Privacy Protection Agency.
              </Paragraph>
            </motion.section>

            {/* Related Pages Footer */}
            <Card className="border bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Related Legal Documents</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Link href="/terms-of-service" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <FileText className="h-4 w-4" />
                    Terms of Service
                  </Link>
                  <Link href="/license" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <FileText className="h-4 w-4" />
                    MIT License
                  </Link>
                  <a href="mailto:privacy@humain-uno.com" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <Mail className="h-4 w-4" />
                    Contact Us
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
