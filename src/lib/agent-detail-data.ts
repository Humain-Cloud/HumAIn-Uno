// ─── Agent Detail Data Enrichment Module ───
// Generates comprehensive, industry-grade curated content for each agent's dedicated detail page
// Including full-length Master Legendary Prompts

import type { KnowledgeAgent } from './types'

// ─── Types ───

export interface Capability {
  title: string
  description: string
  icon: string
}

export interface UseCase {
  title: string
  description: string
  industry: string
  complexity: 'simple' | 'moderate' | 'advanced'
}

export interface MasterPrompt {
  title: string
  category: string
  prompt: string
  tips: string[]
}

export interface ArchitectureInfo {
  pattern: string
  components: string[]
  dataFlow: string
  diagram: string
}

export interface ConfigOption {
  key: string
  type: string
  default: string
  description: string
  required: boolean
}

export interface GettingStartedStep {
  step: number
  title: string
  description: string
  code?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface BestPractice {
  title: string
  description: string
}

export interface Limitation {
  title: string
  description: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

export interface AgentDetailData {
  capabilities: Capability[]
  useCases: UseCase[]
  masterPrompts: MasterPrompt[]
  architecture: ArchitectureInfo
  configuration: ConfigOption[]
  gettingStarted: GettingStartedStep[]
  faq: FAQItem[]
  bestPractices: BestPractice[]
  limitations: Limitation[]
  changelog: ChangelogEntry[]
}

// ─── Category-specific content generators ───

const categoryCapabilities: Record<string, Capability[]> = {
  'Research': [
    { title: 'Literature Review & Synthesis', description: 'Automatically searches, aggregates, and synthesizes findings from academic papers, journals, and research databases to produce comprehensive literature reviews with proper citations and thematic analysis.', icon: 'BookOpen' },
    { title: 'Hypothesis Generation', description: 'Analyzes existing research gaps and generates novel, testable hypotheses with supporting rationale, predicted outcomes, and experimental design suggestions.', icon: 'Brain' },
    { title: 'Data Collection & Analysis', description: 'Designs and executes systematic data collection strategies from diverse sources, then applies statistical and computational analysis methods to extract meaningful patterns and insights.', icon: 'BarChart3' },
    { title: 'Citation Network Mapping', description: 'Builds and visualizes citation networks to identify influential works, emerging trends, and interdisciplinary connections across research domains.', icon: 'GitBranch' },
  ],
  'Data Analytics': [
    { title: 'Real-Time Data Processing', description: 'Ingests, transforms, and analyzes streaming data in real-time, enabling live dashboards, anomaly detection, and automated alerting for critical business metrics.', icon: 'Zap' },
    { title: 'Predictive Modeling', description: 'Builds, trains, and deploys predictive models using historical data, supporting regression, classification, clustering, and time-series forecasting with automated feature engineering.', icon: 'Brain' },
    { title: 'Interactive Visualization', description: 'Generates rich, interactive data visualizations including heatmaps, scatter plots, funnel charts, and geographic maps that support drill-down analysis and storytelling.', icon: 'BarChart3' },
    { title: 'Automated Reporting', description: 'Produces scheduled and on-demand analytical reports with natural language summaries, key findings, trend analysis, and actionable recommendations tailored to stakeholder needs.', icon: 'FileCode' },
  ],
  'Customer Service': [
    { title: 'Intelligent Ticket Routing', description: 'Automatically classifies, prioritizes, and routes customer support tickets to the appropriate team or agent based on topic, urgency, sentiment, and agent expertise matching.', icon: 'Workflow' },
    { title: 'Multi-Channel Support', description: 'Provides consistent, context-aware customer support across email, chat, phone, social media, and self-service portals with unified conversation history and escalation paths.', icon: 'MessageSquare' },
    { title: 'Sentiment & Satisfaction Analysis', description: 'Continuously monitors customer interactions to detect sentiment shifts, predict churn risk, and surface satisfaction drivers through NLP-powered analysis of conversations and feedback.', icon: 'Heart' },
    { title: 'Knowledge Base Management', description: 'Automatically identifies knowledge gaps, suggests new articles based on recurring issues, and maintains FAQ content through continuous learning from resolved tickets.', icon: 'BookOpen' },
  ],
  'Communication': [
    { title: 'Email Drafting & Response', description: 'Composes professional, contextually appropriate emails and responses that match tone, style, and brand guidelines while maintaining consistency across all corporate communications.', icon: 'Mail' },
    { title: 'Meeting Summarization', description: 'Attends virtual meetings, transcribes discussions in real-time, and produces structured summaries with action items, decisions, owners, and deadlines automatically assigned.', icon: 'BookOpen' },
    { title: 'Cross-Language Translation', description: 'Provides accurate, context-aware translation across 50+ languages while preserving nuance, idioms, and technical terminology specific to each business domain.', icon: 'Globe' },
    { title: 'Stakeholder Communication', description: 'Crafts tailored messages for different stakeholder groups (executives, engineers, customers) from the same source information, adapting complexity and focus accordingly.', icon: 'User' },
  ],
  'Marketing': [
    { title: 'Campaign Strategy & Planning', description: 'Develops comprehensive marketing campaign strategies including audience segmentation, channel selection, messaging frameworks, budget allocation, and KPI definition based on market research.', icon: 'Globe' },
    { title: 'Content Generation & Optimization', description: 'Creates SEO-optimized blog posts, social media content, ad copy, and landing page text that drives engagement while maintaining brand voice consistency across all touchpoints.', icon: 'Palette' },
    { title: 'Audience Intelligence', description: 'Analyzes behavioral data, demographics, and psychographics to build dynamic audience segments, predict purchasing patterns, and identify high-value customer profiles.', icon: 'Brain' },
    { title: 'Performance Analytics', description: 'Tracks and analyzes campaign performance across channels with real-time dashboards, attribution modeling, A/B test results, and ROI calculations with actionable optimization recommendations.', icon: 'BarChart3' },
  ],
  'Code Generation': [
    { title: 'Full-Stack Code Scaffolding', description: 'Generates complete, production-ready application code including API routes, database models, UI components, authentication, and deployment configurations from high-level specifications.', icon: 'Code2' },
    { title: 'Intelligent Code Completion', description: 'Provides context-aware code suggestions that understand project architecture, existing patterns, and dependencies to generate consistent, idiomatic code that follows project conventions.', icon: 'Zap' },
    { title: 'Automated Testing & QA', description: 'Generates comprehensive test suites including unit tests, integration tests, and end-to-end tests with mock data, edge case coverage, and mutation testing to ensure code reliability.', icon: 'CheckCircle2' },
    { title: 'Documentation Generation', description: 'Automatically produces API documentation, inline code comments, README files, architecture decision records, and changelog entries that stay synchronized with code changes.', icon: 'FileCode' },
  ],
  'Workflow Automation': [
    { title: 'Process Discovery & Mapping', description: 'Analyzes organizational workflows to identify automation opportunities, map current processes, and design optimized automation workflows with clear trigger conditions and escalation paths.', icon: 'Workflow' },
    { title: 'Multi-System Integration', description: 'Connects and orchestrates workflows across disparate systems including CRMs, ERPs, databases, APIs, and legacy systems through pre-built connectors and custom integration adapters.', icon: 'Layers' },
    { title: 'Conditional Logic & Branching', description: 'Implements complex business rules with conditional branching, parallel execution paths, approval gates, and exception handling to automate sophisticated multi-step business processes.', icon: 'GitBranch' },
    { title: 'Monitoring & Alerting', description: 'Provides real-time workflow execution monitoring with SLA tracking, bottleneck detection, failure alerting, and automated retry mechanisms with configurable escalation policies.', icon: 'Shield' },
  ],
  'Finance': [
    { title: 'Risk Assessment & Scoring', description: 'Evaluates financial risks through multi-factor analysis including credit risk, market risk, operational risk, and liquidity risk with quantitative scoring models and scenario analysis.', icon: 'Shield' },
    { title: 'Fraud Detection & Prevention', description: 'Monitors transactions in real-time using ML-powered anomaly detection, pattern recognition, and rule-based engines to identify and prevent fraudulent activities with minimal false positives.', icon: 'Search' },
    { title: 'Portfolio Optimization', description: 'Constructs and rebalances investment portfolios using modern portfolio theory, factor models, and risk parity approaches with tax-loss harvesting and ESG constraint optimization.', icon: 'BarChart3' },
    { title: 'Regulatory Compliance', description: 'Automates compliance monitoring and reporting for financial regulations including KYC/AML, SOX, GDPR, and Basel III with audit trail generation and regulatory change tracking.', icon: 'Scale' },
  ],
  'Healthcare': [
    { title: 'Clinical Decision Support', description: 'Provides evidence-based clinical recommendations by analyzing patient data, medical literature, and treatment guidelines to assist healthcare providers in diagnosis and treatment planning.', icon: 'Heart' },
    { title: 'Medical Record Analysis', description: 'Extracts, structures, and analyzes information from unstructured medical records including clinical notes, lab results, and imaging reports to create comprehensive patient timelines.', icon: 'Database' },
    { title: 'Drug Interaction Checking', description: 'Identifies potential drug-drug interactions, contraindications, and allergic reactions by cross-referencing prescription data with comprehensive pharmacological databases and patient history.', icon: 'Shield' },
    { title: 'Population Health Analytics', description: 'Analyzes health trends across patient populations to identify at-risk groups, predict disease outbreaks, optimize resource allocation, and measure intervention effectiveness.', icon: 'BarChart3' },
  ],
  'Cybersecurity': [
    { title: 'Threat Intelligence & Hunting', description: 'Continuously ingests and correlates threat intelligence from multiple feeds, identifies indicators of compromise, and proactively hunts for advanced persistent threats within network and endpoint data.', icon: 'Shield' },
    { title: 'Vulnerability Assessment', description: 'Scans and evaluates systems for security vulnerabilities, prioritizes findings based on exploitability and business impact, and generates remediation plans with specific patch recommendations.', icon: 'Search' },
    { title: 'Incident Response Automation', description: 'Automates incident detection, triage, containment, and recovery workflows with playbook-driven responses, evidence preservation, and post-incident analysis reporting.', icon: 'Zap' },
    { title: 'Compliance & Audit', description: 'Monitors security controls against frameworks (NIST, ISO 27001, SOC 2), tracks compliance posture, and generates audit-ready evidence packages and gap analysis reports.', icon: 'CheckCircle2' },
  ],
  'DevOps': [
    { title: 'CI/CD Pipeline Management', description: 'Designs, implements, and optimizes continuous integration and delivery pipelines with automated testing, security scanning, artifact management, and progressive deployment strategies.', icon: 'Workflow' },
    { title: 'Infrastructure as Code', description: 'Generates and maintains infrastructure definitions using Terraform, CloudFormation, and Pulumi with drift detection, cost optimization, and security hardening best practices built in.', icon: 'Code2' },
    { title: 'Observability & Monitoring', description: 'Configures comprehensive monitoring, logging, and tracing with intelligent alerting, SLO/SLI tracking, and automated runbook execution for common operational issues.', icon: 'Search' },
    { title: 'Container Orchestration', description: 'Manages containerized workloads with Kubernetes, Docker Swarm, or serverless platforms including auto-scaling, service mesh configuration, and zero-downtime deployment strategies.', icon: 'Layers' },
  ],
  'Agriculture': [
    { title: 'Crop Health Monitoring', description: 'Analyzes satellite imagery, drone data, and IoT sensor readings to monitor crop health, detect diseases early, and recommend targeted interventions to maximize yield and minimize waste.', icon: 'Sprout' },
    { title: 'Precision Agriculture', description: 'Optimizes resource allocation by analyzing soil composition, weather patterns, and historical yield data to recommend precise irrigation, fertilization, and pest management schedules.', icon: 'Brain' },
    { title: 'Supply Chain Optimization', description: 'Tracks agricultural products from farm to table, optimizing logistics, reducing waste, ensuring cold chain compliance, and providing traceability for food safety certification.', icon: 'Workflow' },
    { title: 'Weather Risk Assessment', description: 'Forecasts weather-related risks using ensemble models and historical data, providing actionable recommendations for planting, harvesting, and resource protection decisions.', icon: 'Shield' },
  ],
  'Business': [
    { title: 'Strategic Planning & Analysis', description: 'Facilitates strategic planning by analyzing market trends, competitive landscapes, and internal capabilities to identify growth opportunities and develop actionable business strategies.', icon: 'Briefcase' },
    { title: 'Financial Modeling', description: 'Builds comprehensive financial models including DCF, LBO, and scenario analyses with sensitivity testing, Monte Carlo simulations, and board-ready presentation outputs.', icon: 'BarChart3' },
    { title: 'Market Research Automation', description: 'Automates market research by aggregating data from industry reports, competitor filings, social media, and patent databases to deliver actionable market intelligence reports.', icon: 'Search' },
    { title: 'Decision Support Systems', description: 'Provides data-driven decision support through multi-criteria analysis, risk quantification, and scenario modeling to help executives make informed strategic decisions.', icon: 'Brain' },
  ],
  'E-commerce': [
    { title: 'Product Recommendation Engine', description: 'Delivers personalized product recommendations using collaborative filtering, content-based analysis, and real-time behavioral signals to increase conversion rates and average order value.', icon: 'ShoppingBag' },
    { title: 'Dynamic Pricing Optimization', description: 'Optimizes pricing strategies in real-time based on demand elasticity, competitor pricing, inventory levels, and customer segmentation to maximize revenue and margin.', icon: 'BarChart3' },
    { title: 'Inventory Management', description: 'Forecasts demand, optimizes stock levels, automates reorder points, and manages multi-warehouse inventory with seasonal trend analysis and supplier lead time tracking.', icon: 'Database' },
    { title: 'Customer Journey Optimization', description: 'Maps and optimizes the entire customer journey from awareness to purchase, identifying friction points, optimizing funnels, and personalizing touchpoints to reduce churn and increase LTV.', icon: 'Workflow' },
  ],
  'Education': [
    { title: 'Adaptive Learning Paths', description: 'Creates personalized learning trajectories that adapt in real-time based on student performance, learning style, pace, and knowledge gaps to optimize educational outcomes.', icon: 'GraduationCap' },
    { title: 'Automated Assessment', description: 'Generates and evaluates assessments with varied question types, automated grading with detailed feedback, plagiarism detection, and learning outcome alignment tracking.', icon: 'CheckCircle2' },
    { title: 'Content Curation & Generation', description: 'Curates and generates educational content including lesson plans, study materials, interactive exercises, and multimedia resources aligned to curriculum standards and learning objectives.', icon: 'BookOpen' },
    { title: 'Student Analytics', description: 'Provides comprehensive learning analytics including engagement tracking, performance prediction, at-risk student identification, and intervention effectiveness measurement.', icon: 'BarChart3' },
  ],
  'Travel': [
    { title: 'Itinerary Planning & Optimization', description: 'Generates optimized travel itineraries considering preferences, budget, time constraints, seasonal factors, and local events while accounting for travel times and logistics.', icon: 'Plane' },
    { title: 'Dynamic Pricing & Availability', description: 'Monitors and predicts pricing trends for flights, hotels, and activities, alerting users to optimal booking windows and managing reservations across multiple providers.', icon: 'BarChart3' },
    { title: 'Personalized Recommendations', description: 'Delivers hyper-personalized destination, restaurant, and activity recommendations based on travel history, preferences, group composition, and real-time local conditions.', icon: 'Heart' },
    { title: 'Travel Risk Management', description: 'Monitors travel advisories, weather events, health alerts, and geopolitical risks, providing proactive notifications and alternative arrangements when disruptions occur.', icon: 'Shield' },
  ],
  'Entertainment': [
    { title: 'Content Recommendation', description: 'Powers personalized content discovery using collaborative filtering, content analysis, and contextual signals to surface relevant movies, music, games, and articles.', icon: 'Music' },
    { title: 'Creative Content Generation', description: 'Generates creative content including scripts, lyrics, game narratives, and visual concepts using advanced language models with style transfer and genre-specific training.', icon: 'Palette' },
    { title: 'Audience Analytics', description: 'Analyzes audience behavior, engagement patterns, and sentiment across platforms to optimize content strategy, release timing, and marketing spend allocation.', icon: 'BarChart3' },
    { title: 'Trend Forecasting', description: 'Identifies emerging entertainment trends, viral content patterns, and cultural shifts through social listening, search analysis, and cross-platform engagement tracking.', icon: 'Brain' },
  ],
  'Gaming': [
    { title: 'Procedural Content Generation', description: 'Generates game levels, quests, items, and environments procedurally using rule-based systems and ML to create infinite, varied, and balanced gaming experiences.', icon: 'Gamepad2' },
    { title: 'NPC Behavior & Dialogue', description: 'Creates intelligent non-player characters with dynamic behavior trees, contextual dialogue systems, and emotional modeling for immersive, responsive game worlds.', icon: 'MessageSquare' },
    { title: 'Player Analytics & Balancing', description: 'Analyzes player behavior, skill progression, and engagement metrics to balance game mechanics, detect exploits, and optimize difficulty curves for player retention.', icon: 'BarChart3' },
    { title: 'Anti-Cheat Systems', description: 'Detects cheating and exploitation through behavioral analysis, statistical anomaly detection, and client integrity verification to maintain fair competitive environments.', icon: 'Shield' },
  ],
  'Creative': [
    { title: 'Artistic Style Transfer', description: 'Applies learned artistic styles to images, text, and audio while preserving content structure, enabling rapid creative exploration across visual, literary, and musical domains.', icon: 'Palette' },
    { title: 'Collaborative Ideation', description: 'Facilitates creative brainstorming by generating, combining, and refining ideas across disciplines with structured creativity techniques and cross-domain inspiration synthesis.', icon: 'Brain' },
    { title: 'Brand Asset Generation', description: 'Creates consistent brand assets including logos, color palettes, typography pairings, and design systems that maintain visual identity across all brand touchpoints.', icon: 'Layers' },
    { title: 'Content Repurposing', description: 'Transforms creative content across formats and platforms — turning blog posts into social campaigns, videos into articles, and long-form into micro-content — while maintaining message integrity.', icon: 'Workflow' },
  ],
  'Legal': [
    { title: 'Contract Analysis & Review', description: 'Analyzes legal contracts to identify risks, anomalies, and non-standard clauses by comparing against template libraries and flagging deviations from negotiated positions.', icon: 'Scale' },
    { title: 'Legal Research Automation', description: 'Automates case law research by searching, summarizing, and categorizing legal precedents, statutes, and regulatory guidance relevant to specific legal questions and jurisdictions.', icon: 'Search' },
    { title: 'Compliance Monitoring', description: 'Continuously monitors regulatory changes across jurisdictions, assesses impact on business operations, and generates compliance gap analyses with remediation recommendations.', icon: 'Shield' },
    { title: 'Document Drafting', description: 'Generates legal documents including contracts, pleadings, and regulatory filings using jurisdiction-specific templates with clause libraries and automated cross-referencing.', icon: 'FileCode' },
  ],
  'AI/ML': [
    { title: 'Model Training & Fine-Tuning', description: 'Manages the full ML lifecycle from data preparation through model training, hyperparameter optimization, and evaluation with automated experiment tracking and model versioning.', icon: 'Brain' },
    { title: 'Feature Engineering', description: 'Automates feature discovery, transformation, and selection using statistical analysis, domain knowledge, and deep feature synthesis to create high-quality ML input features.', icon: 'Code2' },
    { title: 'Model Serving & Deployment', description: 'Deploys ML models to production with A/B testing, canary releases, model monitoring, drift detection, and automated rollback capabilities for reliable ML operations.', icon: 'Layers' },
    { title: 'Experiment Management', description: 'Tracks and organizes ML experiments with comprehensive logging of parameters, metrics, artifacts, and environmental conditions for reproducibility and knowledge sharing.', icon: 'Database' },
  ],
  'IoT': [
    { title: 'Device Management & Provisioning', description: 'Manages IoT device lifecycle including registration, provisioning, configuration, firmware updates, and decommissioning across heterogeneous device fleets at scale.', icon: 'Cpu' },
    { title: 'Real-Time Data Ingestion', description: 'Ingestes high-throughput sensor data streams with edge preprocessing, data validation, time-series storage, and real-time anomaly detection for immediate operational insights.', icon: 'Zap' },
    { title: 'Predictive Maintenance', description: 'Predicts equipment failures before they occur by analyzing sensor data patterns, vibration signatures, and operational parameters to schedule maintenance and prevent downtime.', icon: 'Wrench' },
    { title: 'Digital Twin Simulation', description: 'Creates and maintains digital twins of physical systems for simulation, what-if analysis, and optimization without disrupting real-world operations.', icon: 'Layers' },
  ],
  'Software Development': [
    { title: 'Full-Stack Development', description: 'Generates complete, production-ready application code spanning frontend, backend, database layers, and deployment configurations from high-level specifications with consistent architecture patterns.', icon: 'Code2' },
    { title: 'API Design & Integration', description: 'Designs RESTful and GraphQL APIs with proper schema definitions, authentication, rate limiting, and integrates with third-party services through well-structured adapter patterns.', icon: 'Workflow' },
    { title: 'Code Quality & Review', description: 'Performs automated code reviews identifying bugs, security vulnerabilities, performance bottlenecks, and style violations while suggesting refactoring improvements with detailed explanations.', icon: 'CheckCircle2' },
    { title: 'Dev Environment Automation', description: 'Automates development environment setup, dependency management, build pipelines, and local testing infrastructure to eliminate configuration drift and accelerate onboarding.', icon: 'Wrench' },
  ],
  'Productivity': [
    { title: 'Task Prioritization & Scheduling', description: 'Analyzes task urgency, dependencies, and resource availability to automatically prioritize work items and generate optimal daily schedules that maximize throughput and minimize context switching.', icon: 'Zap' },
    { title: 'Focus & Time Management', description: 'Monitors work patterns, identifies time sinks and distraction triggers, and provides personalized focus strategies including Pomodoro scheduling, deep-work blocks, and interruption management.', icon: 'Clock' },
    { title: 'Document Drafting & Editing', description: 'Accelerates document creation with intelligent templates, auto-completion, style-consistent editing, grammar checking, and formatting optimization for reports, proposals, and correspondence.', icon: 'FileCode' },
    { title: 'Habit & Goal Tracking', description: 'Tracks personal and team habits against defined goals, provides streak analytics, identifies behavioral patterns, and delivers actionable nudges to maintain momentum toward objectives.', icon: 'BarChart3' },
  ],
  'Media': [
    { title: 'Content Curation & Distribution', description: 'Aggregates, filters, and curates content from diverse sources, then distributes across platforms with optimized scheduling, formatting, and audience-specific customization.', icon: 'Newspaper' },
    { title: 'Audience Engagement Analytics', description: 'Measures and analyzes audience engagement metrics across media channels, identifying peak interaction times, content preferences, and sentiment trends to optimize reach and retention.', icon: 'BarChart3' },
    { title: 'Multimedia Production', description: 'Assists in multimedia content production workflows including script generation, audio-visual synchronization, caption generation, and format adaptation for cross-platform publishing.', icon: 'Palette' },
    { title: 'Misinformation Detection', description: 'Identifies potentially misleading or false content by cross-referencing claims against verified sources, analyzing metadata patterns, and flagging inconsistencies for editorial review.', icon: 'Shield' },
  ],
  'Human Resources': [
    { title: 'Talent Acquisition & Screening', description: 'Automates candidate sourcing, resume parsing, skills assessment, and initial screening interviews to identify top talent while reducing bias and time-to-hire across all positions.', icon: 'Users' },
    { title: 'Employee Onboarding', description: 'Creates personalized onboarding journeys with automated task assignments, documentation delivery, mentor matching, and progress tracking to accelerate new hire productivity.', icon: 'Briefcase' },
    { title: 'Engagement & Retention Analytics', description: 'Monitors employee engagement signals including survey responses, participation rates, and behavioral patterns to predict attrition risk and recommend retention interventions.', icon: 'Heart' },
    { title: 'Policy & Compliance Management', description: 'Maintains and updates HR policies, tracks regulatory compliance requirements across jurisdictions, and automates policy acknowledgment workflows with audit-ready documentation.', icon: 'Scale' },
  ],
  'General': [
    { title: 'Universal Task Automation', description: 'Provides flexible automation capabilities for common cross-domain tasks including data entry, file management, email processing, and report generation with configurable trigger conditions.', icon: 'Workflow' },
    { title: 'Smart Summarization', description: 'Condenses lengthy documents, meetings, and data streams into concise, actionable summaries preserving key insights, decisions, and action items while filtering noise and redundancy.', icon: 'BookOpen' },
    { title: 'Configuration Validation', description: 'Validates system configurations, environment settings, and deployment parameters against best practice templates, flagging inconsistencies and security issues before they reach production.', icon: 'CheckCircle2' },
    { title: 'Cross-Domain Integration', description: 'Bridges disparate systems and data sources through adaptive integration patterns, enabling seamless data flow and workflow coordination across organizational boundaries and technology stacks.', icon: 'Layers' },
  ],
  'Food': [
    { title: 'Recipe Development & Optimization', description: 'Creates and optimizes recipes considering nutritional requirements, dietary restrictions, ingredient availability, and cost constraints while maintaining flavor profiles and presentation standards.', icon: 'ChefHat' },
    { title: 'Food Safety Compliance', description: 'Monitors and ensures compliance with food safety regulations including HACCP, FDA, and local health codes through automated checklist generation, temperature monitoring, and incident documentation.', icon: 'Shield' },
    { title: 'Supply Chain Freshness', description: 'Tracks perishable goods through the supply chain with freshness prediction models, optimal routing algorithms, and automated quality checks to minimize waste and ensure product integrity.', icon: 'Truck' },
    { title: 'Menu Engineering', description: 'Optimizes menu composition based on ingredient costs, popularity analysis, margin contribution, and seasonal availability to maximize profitability while maintaining customer satisfaction.', icon: 'BarChart3' },
  ],
  'Energy': [
    { title: 'Grid Load Prediction', description: 'Forecasts electricity demand using weather data, historical consumption patterns, and event calendars to optimize generation scheduling and prevent grid instability.', icon: 'Bolt' },
    { title: 'Renewable Output Optimization', description: 'Maximizes renewable energy generation through predictive modeling of solar irradiance and wind patterns, panel and turbine positioning recommendations, and storage dispatch optimization.', icon: 'Sprout' },
    { title: 'Carbon Footprint Tracking', description: 'Calculates, tracks, and reports organizational carbon emissions across scopes 1, 2, and 3 with automated data collection, emission factor application, and regulatory reporting.', icon: 'BarChart3' },
    { title: 'Energy Market Analysis', description: 'Analyzes energy market dynamics including pricing trends, regulatory changes, and supply-demand shifts to inform procurement strategies, hedging decisions, and long-term energy planning.', icon: 'Brain' },
  ],
  'Supply Chain': [
    { title: 'Demand Forecasting', description: 'Predicts product demand using machine learning models that incorporate historical sales, seasonal patterns, market trends, and external signals to optimize inventory and production planning.', icon: 'BarChart3' },
    { title: 'Supplier Risk Assessment', description: 'Evaluates supplier reliability through financial health analysis, geographic risk mapping, compliance tracking, and performance scoring to proactively identify and mitigate supply disruptions.', icon: 'Shield' },
    { title: 'Route Optimization', description: 'Calculates optimal shipping routes considering cost, transit time, fuel consumption, customs requirements, and real-time conditions to minimize logistics expenses while meeting delivery commitments.', icon: 'Truck' },
    { title: 'Inventory Optimization', description: 'Determines optimal inventory levels across warehouses using demand variability, lead time analysis, safety stock calculations, and ABC classification to balance service levels with carrying costs.', icon: 'Database' },
  ],
  'Real Estate': [
    { title: 'Property Valuation', description: 'Estimates property values using comparable sales analysis, neighborhood trend data, property characteristics, and market conditions to provide accurate, data-driven valuations for buyers, sellers, and lenders.', icon: 'Building' },
    { title: 'Lease Analysis', description: 'Analyzes lease terms including rent escalations, renewal options, tenant improvement allowances, and operating expense structures to identify favorable terms and potential hidden costs.', icon: 'Scale' },
    { title: 'Market Trend Forecasting', description: 'Predicts real estate market trends using macroeconomic indicators, demographic shifts, zoning changes, and development pipeline data to inform investment timing and location selection.', icon: 'BarChart3' },
    { title: 'Investment Portfolio Analysis', description: 'Evaluates real estate portfolio performance with metrics including NOI, cap rate, cash-on-cash return, and IRR, providing diversification recommendations and risk-adjusted return optimization.', icon: 'Briefcase' },
  ],
}

// ─── Framework-specific architecture patterns ───

const frameworkArchitectures: Record<string, ArchitectureInfo> = {
  'LangGraph': {
    pattern: 'Stateful Graph-Based Agent Orchestration (ReAct Pattern)',
    components: ['State Graph', 'Node Functions', 'Conditional Edges', 'Checkpoint Store', 'Tool Registry', 'Memory Manager'],
    dataFlow: 'User Input → State Initialization → Graph Traversal (Node → Edge Decision → Next Node) → Tool Execution → State Update → Response Generation → Output',
    diagram: '┌──────────┐     ┌──────────┐     ┌──────────┐\n│  User    │────▶│  Agent   │────▶│  Tool    │\n│  Input   │     │  Node    │     │  Node    │\n└──────────┘     └────┬─────┘     └────┬─────┘\n                      │                │\n                ┌─────▼─────┐   ┌─────▼─────┐\n                │ Condition  │   │  Result    │\n                │  Edge      │   │  Update    │\n                └─────┬─────┘   └─────┬─────┘\n                      │                │\n                      └───────┬────────┘\n                          ┌───▼───┐\n                          │ Output │\n                          └───────┘',
  },
  'CrewAI': {
    pattern: 'Multi-Agent Crew Collaboration with Role-Based Delegation',
    components: ['Crew Orchestrator', 'Agent Roles', 'Task Queue', 'Delegation Manager', 'Memory Store', 'Tool Registry'],
    dataFlow: 'User Input → Task Decomposition → Agent Assignment → Sequential/Parallel Execution → Delegation & Handoff → Result Aggregation → Final Output',
    diagram: '┌──────────┐     ┌──────────────────────┐\n│  User    │────▶│   Crew Orchestrator   │\n│  Input   │     └───┬──────┬──────┬─────┘\n└──────────┘         │      │      │\n               ┌─────▼──┐ ┌─▼────┐ ┌▼───────┐\n               │Agent 1 │ │Agent2│ │Agent 3 │\n               │(Role)  │ │(Role)│ │(Role)  │\n               └───┬────┘ └──┬───┘ └───┬────┘\n                   │         │        │\n               ┌───▼─────────▼────────▼──┐\n               │   Result Aggregation     │\n               └────────────┬─────────────┘\n                         ┌──▼──┐\n                         │Output│\n                         └─────┘',
  },
  'AutoGen': {
    pattern: 'Conversational Multi-Agent System with Human-in-the-Loop',
    components: ['Conversation Manager', 'Agent Persona', 'Message Router', 'Human Proxy', 'Code Executor', 'Tool Integration'],
    dataFlow: 'User Message → Agent Selection → Conversation Round → Message Routing → Tool/Code Execution → Human Review (Optional) → Next Round or Final Response',
    diagram: '┌──────────┐     ┌──────────────────┐\n│  Human   │◀───▶│  Conversation     │\n│  Proxy   │     │  Manager          │\n└──────────┘     └──┬─────┬─────┬───┘\n                    │     │     │\n              ┌─────▼─┐ ┌─▼───┐ ┌▼─────┐\n              │Agent A│◀▶│Agent│◀▶│Agent C│\n              │       │  │  B  │  │      │\n              └───┬───┘  └──┬──┘ └──┬───┘\n                  │         │       │\n              ┌───▼─────────▼───────▼──┐\n              │  Code / Tool Executor   │\n              └───────────┬─────────────┘\n                      ┌──▼──┐\n                      │Output│\n                      └─────┘',
  },
  'Agno': {
    pattern: 'Lightweight Agent Framework with Agentic Tool Use',
    components: ['Agent Core', 'Tool Registry', 'Memory Backend', 'Model Router', 'Storage Layer', 'Reasoning Engine'],
    dataFlow: 'User Query → Model Selection → Reasoning Chain → Tool Invocation → Result Processing → Memory Update → Response',
    diagram: '┌──────────┐     ┌──────────────┐\n│  User    │────▶│  Agent Core  │\n│  Query   │     └──┬───┬───┬───┘\n└──────────┘        │   │   │\n              ┌─────▼┐ ┌▼──┐ ┌▼──────┐\n              │Model │ │Tool│ │Memory  │\n              │Router│ │Reg │ │Backend │\n              └──┬───┘ └─┬──┘ └───┬───┘\n                 │       │       │\n              ┌──▼───────▼───────▼──┐\n              │  Reasoning Engine    │\n              └──────────┬───────────┘\n                      ┌──▼──┐\n                      │Output│\n                      └─────┘',
  },
  'LlamaIndex': {
    pattern: 'Retrieval-Augmented Generation (RAG) with Indexed Knowledge',
    components: ['Query Engine', 'Retriever', 'Index Store', 'Response Synthesizer', 'Document Loader', 'Node Parser'],
    dataFlow: 'User Query → Query Transformation → Index Retrieval → Context Assembly → LLM Generation → Citation Attachment → Response',
    diagram: '┌──────────┐     ┌──────────────┐     ┌──────────┐\n│  User    │────▶│    Query     │────▶│ Retriever│\n│  Query   │     │  Transform   │     │          │\n└──────────┘     └──────────────┘     └────┬─────┘\n                                           │\n                                    ┌──────▼──────┐\n                                    │ Index Store  │\n                                    │ (Vector/KB)  │\n                                    └──────┬──────┘\n                                           │\n┌──────────┐     ┌──────────────┐     ┌────▼─────┐\n│ Response │◀────│  LLM Synth   │◀────│ Context  │\n│ +Cite    │     │              │     │ Assembly │\n└──────────┘     └──────────────┘     └──────────┘',
  },
}

const defaultArchitecture: ArchitectureInfo = {
  pattern: 'Modular Agent Architecture with Tool-Augmented Reasoning',
  components: ['Agent Core', 'Tool Registry', 'Memory Store', 'Reasoning Engine', 'Output Formatter'],
  dataFlow: 'User Input → Intent Parsing → Tool Selection → Execution → Result Synthesis → Response',
  diagram: '┌──────────┐     ┌──────────┐     ┌──────────┐\n│  User    │────▶│  Agent   │────▶│  Tools   │\n│  Input   │     │  Core    │     │  & APIs  │\n└──────────┘     └────┬─────┘     └────┬─────┘\n                      │                │\n                ┌─────▼─────┐   ┌─────▼─────┐\n                │ Reasoning  │   │  Result    │\n                │ Engine     │   │  Synthesis │\n                └─────┬─────┘   └─────┬─────┘\n                      └───────┬────────┘\n                          ┌───▼───┐\n                          │ Output │\n                          └───────┘',
}

// ─── Master Prompt generation based on category + framework ───

function generateMasterPrompts(agent: KnowledgeAgent): MasterPrompt[] {
  const cat = agent.category || 'AI/ML'
  const fw = agent.framework || 'LangGraph'
  const tools = agent.tools || []
  const llm = agent.llm || 'GPT-4'
  const name = agent.name

  // Base prompts that are customized per category
  const prompts: MasterPrompt[] = []

  // ─── Prompt 1: System/Role Definition Prompt ───
  prompts.push({
    title: `${name} — System Initialization & Role Definition Prompt`,
    category: 'System Prompt',
    prompt: `You are ${name}, an advanced AI agent specialized in ${cat} built on the ${fw} framework. Your primary mission is to deliver exceptional, production-grade results in ${cat} by combining deep domain expertise with rigorous analytical methodology.

## Core Identity & Mandate
You are an expert ${cat} agent with the reasoning capabilities of a senior domain specialist. You think systematically, act deliberately, and communicate with precision. Every response you produce must be actionable, well-structured, and grounded in established ${cat} best practices. You never provide generic advice — every recommendation must be specific, contextualized, and backed by clear rationale.

## Operational Framework
You operate within the ${fw} orchestration model, which means you:
1. **Plan before executing** — Break complex tasks into discrete, manageable steps before taking action
2. **Validate at each stage** — Verify intermediate results against quality criteria before proceeding
3. **Iterate when necessary** — If initial results don't meet quality thresholds, refine your approach rather than proceeding with suboptimal outputs
4. **Document your reasoning** — Make your thought process transparent so human collaborators can understand and validate your decisions

## Tool Usage Protocol
${tools.length > 0 ? `You have access to the following tools: ${tools.join(', ')}. Use these tools strategically — each tool invocation should serve a clear purpose in advancing toward the user's goal. Before calling any tool, explicitly state: (a) why you need this tool, (b) what specific information you expect to gain, and (c) how the result will influence your next step. Never invoke tools out of curiosity or habit — every call must be justified.` : 'While no specific external tools are configured, you should leverage your built-in knowledge and reasoning capabilities to their fullest extent, and clearly indicate when external data or tools would be needed for optimal results.'}

## Output Quality Standards
- **Accuracy**: All factual claims must be verifiable. If uncertain, express confidence levels explicitly.
- **Completeness**: Address all aspects of the user's request. If some aspects are ambiguous, ask clarifying questions rather than making assumptions.
- **Structure**: Use clear headings, bullet points, and numbered lists. Long responses should include a summary.
- **Actionability**: Every recommendation must include specific next steps, expected outcomes, and potential risks.
- **Context Awareness**: Adapt your response complexity and depth to match the user's expertise level and use case.

## Boundary Conditions
- If a request falls outside your ${cat} domain, explicitly acknowledge the limitation and provide the best guidance you can while recommending domain-appropriate resources
- If you detect potential ethical concerns (data privacy, bias, security vulnerabilities), raise them proactively before proceeding
- If the user's goal is ambiguous, present 2-3 possible interpretations and ask for clarification rather than guessing
- Always maintain appropriate confidence levels — express uncertainty when warranted rather than presenting speculation as fact

## Model Configuration
You are powered by ${llm}, which provides your core reasoning capabilities. Leverage the model's strengths in ${cat} while being mindful of its limitations regarding knowledge cutoffs and potential hallucination in specialized domains.`,
    tips: [
      `Customize the domain expertise section by replacing generic ${cat} knowledge with your organization's specific standards and terminology`,
      'Add organization-specific tool configurations and API endpoints to make the agent immediately useful in your environment',
      `Include few-shot examples relevant to your most common ${cat} use cases in the system prompt for more consistent outputs`,
      'Test the prompt with edge cases in your domain before deploying to production — adjust confidence thresholds based on results',
      'Consider adding a "response format" section specifying JSON schema or markdown templates if you need structured, parseable outputs',
    ],
  })

  // ─── Prompt 2: Task Execution Prompt ───
  prompts.push({
    title: `${name} — Advanced Task Execution & Reasoning Prompt`,
    category: 'Task Prompt',
    prompt: `Execute the following ${cat} task using the ${fw} agent framework with maximum rigor and precision. Apply the structured reasoning methodology outlined below to ensure comprehensive, high-quality results.

## Task Analysis Phase
Before beginning execution, perform a thorough analysis of the task:

1. **Requirement Decomposition**: Break the task into atomic sub-tasks. For each sub-task, identify:
   - Required inputs and their sources
   - Expected outputs and their formats
   - Dependencies on other sub-tasks
   - Estimated complexity (simple/moderate/complex)
   - Tools or data needed for completion

2. **Context Assessment**: Evaluate the operational context:
   - What is the user's expertise level in ${cat}?
   - What is the urgency and impact level of this task?
   - Are there compliance, regulatory, or ethical constraints to consider?
   - What are the success criteria and quality thresholds?

3. **Risk Identification**: Proactively identify potential issues:
   - Data quality or availability risks
   - Tool limitation or failure scenarios
   - Ambiguity in requirements that could lead to misinterpretation
   - Edge cases that might produce unexpected results

## Execution Strategy
Based on your analysis, execute using the ${fw} pattern:

${fw === 'LangGraph' ? `**LangGraph ReAct Pattern:**
- Initialize your state graph with clear entry and exit conditions
- For each reasoning step: Observe → Think → Act → Reflect
- Use conditional edges to branch based on intermediate results
- Implement checkpoint-based recovery for long-running tasks
- Maintain a running state that accumulates context across steps` 
: fw === 'CrewAI' ? `**CrewAI Delegation Pattern:**
- Decompose the task into roles and responsibilities
- Assign sub-tasks to specialized agent personas
- Implement sequential and parallel execution as appropriate
- Use delegation for sub-tasks requiring different expertise
- Aggregate results through structured synthesis` 
: fw === 'AutoGen' ? `**AutoGen Conversational Pattern:**
- Structure the task as a multi-turn conversation
- Assign clear roles to each participating agent
- Use human-in-the-loop checkpoints for critical decisions
- Implement code execution for computational sub-tasks
- Maintain conversation context across agent turns` 
: fw === 'LlamaIndex' ? `**LlamaIndex RAG Pattern:**
- Transform the user query for optimal retrieval
- Retrieve relevant context from indexed knowledge bases
- Assemble retrieved context with task-specific instructions
- Generate responses grounded in retrieved evidence
- Attach citations and confidence scores to all claims` 
: `**Agentic Reasoning Pattern:**
- Parse the task intent and decompose into steps
- Select appropriate tools for each step
- Execute with validation at each stage
- Synthesize results into a coherent response`}

## Quality Assurance Protocol
After generating your response, perform self-evaluation:

1. **Completeness Check**: Have all aspects of the task been addressed? Are there implicit requirements that should be explicitly handled?
2. **Accuracy Verification**: Are all claims, data points, and recommendations verifiable? Flag any uncertain assertions.
3. **Consistency Review**: Are there contradictions or inconsistencies across different parts of the response?
4. **Actionability Assessment**: Can the user immediately act on your recommendations, or are there prerequisite steps missing?
5. **Format Compliance**: Does the response match the expected format and structure?

## Response Format
Structure your response as follows:
- **Executive Summary**: 2-3 sentence overview of the task and key findings
- **Detailed Analysis**: Comprehensive treatment of each sub-task
- **Recommendations**: Specific, prioritized action items with rationale
- **Risks & Mitigations**: Potential issues and how to address them
- **Next Steps**: Clear path forward with expected outcomes
- **Appendix**: Supporting data, calculations, or references as needed`,
    tips: [
      'Pre-fill the task analysis phase with known constraints and context specific to your organization before sending to the agent',
      'Use the quality assurance protocol as a rubric for human review — it creates a shared evaluation framework between AI and human operators',
      `For complex ${cat} tasks, break the execution into multiple agent calls with intermediate checkpoints rather than one large request`,
      'Customize the response format section to match your team\'s documentation standards and stakeholder reporting requirements',
      'Add domain-specific validation rules to the QA protocol — e.g., for Finance tasks, add "Regulatory compliance check" as a mandatory QA step',
    ],
  })

  // ─── Prompt 3: Category-specific specialized prompt ───
  const specializedPrompt = getCategorySpecializedPrompt(name, cat, fw, tools, llm)
  prompts.push(specializedPrompt)

  return prompts
}

function getCategorySpecializedPrompt(name: string, cat: string, fw: string, tools: string[], llm: string): MasterPrompt {
  // Generate a highly specialized prompt based on category
  const catLower = cat.toLowerCase()

  if (catLower.includes('research')) {
    return {
      title: `${name} — Deep Research Synthesis & Analysis Prompt`,
      category: 'Specialized Domain Prompt',
      prompt: `Conduct a comprehensive research analysis on the specified topic using the ${name} agent framework. You are performing academic-grade research synthesis that will be used for decision-making and knowledge advancement in ${cat}.

## Research Methodology Protocol

### Phase 1: Systematic Literature Discovery
Execute a systematic search across multiple academic and professional databases:
- **Search Strategy**: Design a Boolean search query that captures the core topic plus related terminology, synonyms, and domain-specific jargon. Include both broad exploratory terms and narrow targeted terms.
- **Source Prioritization**: Prioritize sources in this order: (1) Peer-reviewed journal articles, (2) Conference proceedings from top-tier venues, (3) Preprints from reputable archives, (4) Industry white papers and technical reports, (5) Expert blog posts and community resources.
- **Inclusion/Exclusion Criteria**: Define clear criteria for which sources to include. Consider: publication date (prefer last 5 years unless seminal), methodology rigor, sample size, citation count, and relevance to the specific research question.
- **Deduplication**: Remove duplicate findings across databases and consolidate references.

### Phase 2: Critical Analysis & Synthesis
For each source included in the review:
1. **Methodology Assessment**: Evaluate the research methodology for rigor, validity, and potential biases. Flag studies with small sample sizes, confounding variables, or methodological weaknesses.
2. **Finding Extraction**: Extract key findings, effect sizes, confidence intervals, and statistical significance levels. Note when findings are correlational vs. causal.
3. **Convergence Analysis**: Identify where findings converge across studies (strong evidence), where they diverge (requires deeper investigation), and where evidence is absent (research gaps).
4. **Quality Weighting**: Weight findings by study quality — a single well-designed RCT should carry more weight than multiple observational studies with confounding variables.

### Phase 3: Gap Identification & Future Directions
- Identify methodological gaps in the existing literature
- Highlight underexplored subtopics and populations
- Suggest specific research questions that would advance the field
- Propose experimental designs that could fill identified gaps

### Phase 4: Knowledge Synthesis Output
Produce a structured synthesis that includes:
- **Thematic Analysis**: Organize findings by theme rather than by study — this reveals patterns that study-by-study summaries miss
- **Evidence Matrix**: Create a structured comparison of key studies (methodology, findings, quality, relevance)
- **Convergence Map**: Visual representation of where evidence aligns and where it conflicts
- **Confidence Assessment**: For each major finding, provide a confidence level (High/Medium/Low) with explicit justification
- **Actionable Insights**: Translate research findings into practical recommendations with appropriate caveats about generalizability

## Citation & Attribution Standards
- Every factual claim must be attributed to a specific source
- Use consistent citation formatting throughout
- Distinguish between primary findings and author interpretations
- When synthesizing across studies, make the synthesis logic explicit

## Ethical Research Practices
- Acknowledge limitations and potential biases in the evidence base
- Do not overstate findings or imply causation from correlation
- Present conflicting evidence fairly without cherry-picking
- Disclose any assumptions made during the synthesis process`,
      tips: [
        'Provide the agent with seed papers or key references to anchor the literature search and ensure relevance to your specific domain',
        'Use the evidence matrix output to create a living document that your team can update as new research becomes available',
        'For high-stakes decisions, require the agent to present the strongest evidence against its recommendations alongside the supporting evidence',
        'Consider running the research synthesis prompt multiple times with different search strategies to ensure comprehensive coverage',
        'Add domain-specific databases and repositories to the search strategy (e.g., arXiv for physics, PubMed for biomedical, SSRN for social science)',
      ],
    }
  }

  if (catLower.includes('data') || catLower.includes('analytics')) {
    return {
      title: `${name} — Advanced Data Analysis & Insight Generation Prompt`,
      category: 'Specialized Domain Prompt',
      prompt: `Perform a comprehensive data analysis on the provided dataset using the ${name} agent. Execute a rigorous, multi-stage analytical workflow that transforms raw data into actionable business intelligence.

## Analytical Workflow Framework

### Stage 1: Data Profiling & Quality Assessment
Begin with a thorough examination of the data:
- **Schema Analysis**: Document the structure, data types, relationships, and cardinality of all fields
- **Statistical Profiling**: Compute descriptive statistics (central tendency, dispersion, distribution shape) for all numeric fields; compute frequency distributions and cardinality for categorical fields
- **Missing Data Analysis**: Quantify missingness patterns — is data Missing Completely at Random (MCAR), Missing at Random (MAR), or Missing Not at Random (MNAR)? Recommend appropriate imputation strategies based on the missingness mechanism
- **Outlier Detection**: Apply multiple outlier detection methods (IQR, Z-score, Isolation Forest, DBSCAN) and classify outliers as: (a) Data quality issues to remove, (b) Valid extreme values to retain, (c) Interesting anomalies requiring investigation
- **Data Quality Score**: Produce an overall data quality score (0-100) with breakdowns by dimension (completeness, accuracy, consistency, timeliness)

### Stage 2: Exploratory Data Analysis (EDA)
Conduct systematic EDA to uncover patterns, relationships, and anomalies:
- **Univariate Analysis**: Distribution shapes, modality, skewness, kurtosis with appropriate visualizations
- **Bivariate Analysis**: Correlation matrices, scatter plots, cross-tabulations with statistical significance testing
- **Multivariate Analysis**: PCA/t-SNE for dimensionality reduction visualization, clustering for natural groupings
- **Temporal Analysis**: If time-series data, decompose into trend, seasonality, and residual components; test for stationarity, autocorrelation, and structural breaks
- **Segmentation Discovery**: Apply clustering algorithms (K-means, DBSCAN, hierarchical) to identify natural customer/behavior segments

### Stage 3: Hypothesis Testing & Statistical Inference
For each business question, formulate and test appropriate hypotheses:
- Select the correct statistical test based on data type, distribution, and sample size
- Report p-values with effect sizes and confidence intervals — statistical significance without practical significance is not actionable
- Apply multiple comparison corrections (Bonferroni, FDR) when testing multiple hypotheses simultaneously
- Clearly distinguish between statistical significance and practical/business significance

### Stage 4: Predictive Modeling (when applicable)
If the analysis warrants predictive capabilities:
- **Feature Engineering**: Create derived features with clear documentation of the transformation logic
- **Model Selection**: Compare multiple model families (linear, tree-based, neural, ensemble) using cross-validation
- **Hyperparameter Tuning**: Use systematic tuning (grid/random/Bayesian search) with proper validation protocols
- **Model Evaluation**: Report multiple metrics appropriate to the problem type; include calibration analysis for probability outputs
- **Interpretability**: Provide SHAP values, feature importance, or partial dependence plots to explain model decisions

### Stage 5: Insight Synthesis & Recommendations
Transform analytical findings into business actions:
- Prioritize insights by business impact (revenue, cost, risk) and confidence level
- For each insight, provide: what was found, why it matters, what action to take, and what the expected outcome is
- Quantify the business value of recommendations where possible (e.g., "Implementing this segmentation could increase campaign ROI by an estimated 15-25%")
- Identify quick wins vs. strategic initiatives with different time horizons`,
      tips: [
        'Pre-profile your data before running the full analysis — knowing the data shape and quality issues upfront helps the agent choose appropriate methods',
        'Provide business context and KPIs alongside the data — the agent will prioritize analyses most relevant to your business objectives',
        'For production analyses, request the agent to generate a reproducible analysis pipeline (code) that can be scheduled and re-run with fresh data',
        'Ask the agent to produce both a technical appendix (for data team) and an executive summary (for stakeholders) from the same analysis',
        'Include domain-specific validation rules (e.g., "revenue should never be negative", "customer age should be 18-120") to catch data quality issues early',
      ],
    }
  }

  // Default specialized prompt for other categories
  return {
    title: `${name} — ${cat} Domain Expert Execution Prompt`,
    category: 'Specialized Domain Prompt',
    prompt: `Execute a comprehensive ${cat} task as ${name}, an expert agent built on the ${fw} framework. Apply domain-specific best practices and methodologies to deliver production-grade results.

## Domain Expert Configuration
You are configured as a senior ${cat} specialist with deep expertise in:
- Industry-standard frameworks and methodologies relevant to ${cat}
- Best practices and common anti-patterns in the ${cat} domain
- Regulatory and compliance requirements that apply to ${cat} operations
- Key performance indicators and success metrics for ${cat} initiatives
- Integration patterns with adjacent domains and systems

## Execution Methodology

### Step 1: Context Gathering & Requirement Clarification
- Identify all stakeholders and their specific needs and expectations
- Map the current state, desired state, and the gap between them
- Identify constraints (technical, regulatory, organizational, budgetary)
- Define measurable success criteria and acceptance standards
- Assess risk tolerance and establish appropriate guardrails

### Step 2: Solution Design & Planning
- Develop a structured solution approach with clear milestones
- Identify required resources, tools, and dependencies
- Design the solution architecture with appropriate patterns for ${cat}
- Plan for edge cases, failure modes, and recovery scenarios
- Establish validation checkpoints and quality gates

### Step 3: Implementation & Execution
${tools.length > 0 ? `Available tools for execution: ${tools.join(', ')}
- Select tools strategically based on task requirements
- Validate tool outputs before incorporating them into the solution
- Implement error handling and fallback strategies for tool failures` : '- Leverage your built-in capabilities and knowledge to execute the task'}

### Step 4: Validation & Quality Assurance
- Verify outputs against defined success criteria
- Perform peer-review level quality checks on all deliverables
- Test edge cases and boundary conditions
- Document any deviations from the original plan with rationale
- Produce an audit trail of key decisions and their justifications

### Step 5: Delivery & Knowledge Transfer
- Present results in a format appropriate for the audience
- Include executive summary for leadership and detailed technical documentation for practitioners
- Document lessons learned and improvement opportunities
- Provide maintenance and operational guidance for ongoing use
- Archive working artifacts for future reference and reproducibility

## Domain-Specific Quality Standards
For ${cat} deliverables, ensure compliance with:
- Industry best practices and recognized frameworks
- Organizational standards and style guides
- Accessibility and inclusivity requirements
- Security and privacy considerations
- Performance and scalability requirements appropriate to the use case

## Communication Protocol
- Use precise, domain-appropriate terminology
- Provide context for technical concepts when the audience may include non-specialists
- Structure communications with clear hierarchy: summary → details → appendix
- Include visual aids (diagrams, tables, charts) where they enhance understanding
- Proactively flag risks, assumptions, and open questions`,
    tips: [
      `Customize the domain expert configuration section with your organization's specific ${cat} standards, terminology, and compliance requirements`,
      'Add real examples from your domain to the prompt — few-shot examples dramatically improve output quality and consistency',
      'For regulated industries, add explicit compliance checkpoints in the validation phase with references to specific regulations',
      'Include your organization\'s style guide and documentation templates in the delivery phase to ensure consistent output formatting',
      'Consider creating variant prompts for different audience levels (technical vs. executive) and use cases within the same domain',
    ],
  }
}

// ─── Configuration generation ───

function generateConfiguration(agent: KnowledgeAgent): ConfigOption[] {
  const fw = agent.framework || 'LangGraph'
  const llm = agent.llm || 'GPT-4'

  const baseConfig: ConfigOption[] = [
    { key: 'LLM_MODEL', type: 'string', default: llm, description: 'The language model to use for reasoning and generation', required: true },
    { key: 'TEMPERATURE', type: 'float', default: '0.7', description: 'Controls randomness in outputs. Lower values (0.1-0.3) for deterministic tasks, higher (0.7-1.0) for creative tasks', required: false },
    { key: 'MAX_TOKENS', type: 'integer', default: '4096', description: 'Maximum number of tokens in the generated response', required: false },
    { key: 'TIMEOUT_SECONDS', type: 'integer', default: '120', description: 'Maximum execution time per agent call before timeout', required: false },
    { key: 'VERBOSE', type: 'boolean', default: 'false', description: 'Enable detailed logging of agent reasoning and tool calls', required: false },
  ]

  if (fw === 'LangGraph') {
    baseConfig.push(
      { key: 'CHECKPOINT_DB', type: 'string', default: 'sqlite:///checkpoints.db', description: 'Database URL for LangGraph state checkpoints', required: false },
      { key: 'MAX_ITERATIONS', type: 'integer', default: '25', description: 'Maximum number of graph traversal iterations per request', required: false },
      { key: 'RECURSION_LIMIT', type: 'integer', default: '10', description: 'Maximum recursion depth for conditional edge evaluation', required: false },
    )
  } else if (fw === 'CrewAI') {
    baseConfig.push(
      { key: 'CREW_PROCESS', type: 'string', default: 'sequential', description: 'Crew execution process: sequential, hierarchical, or consensus', required: false },
      { key: 'MAX_RPM', type: 'integer', default: '10', description: 'Maximum requests per minute to the LLM provider', required: false },
      { key: 'MEMORY_ENABLED', type: 'boolean', default: 'true', description: 'Enable short-term and long-term memory for crew agents', required: false },
    )
  } else if (fw === 'AutoGen') {
    baseConfig.push(
      { key: 'HUMAN_INPUT_MODE', type: 'string', default: 'NEVER', description: 'When to prompt for human input: ALWAYS, NEVER, or TERMINATE', required: false },
      { key: 'MAX_CONSECUTIVE_AUTO_REPLY', type: 'integer', default: '10', description: 'Maximum consecutive auto-replies before requiring human input', required: false },
      { key: 'CODE_EXECUTION', type: 'boolean', default: 'true', description: 'Enable code execution capability for agent assistants', required: false },
    )
  } else if (fw === 'LlamaIndex') {
    baseConfig.push(
      { key: 'CHUNK_SIZE', type: 'integer', default: '1024', description: 'Size of document chunks for indexing in tokens', required: false },
      { key: 'CHUNK_OVERLAP', type: 'integer', default: '200', description: 'Overlap between consecutive chunks in tokens', required: false },
      { key: 'SIMILARITY_TOP_K', type: 'integer', default: '5', description: 'Number of top similar documents to retrieve per query', required: false },
      { key: 'EMBED_MODEL', type: 'string', default: 'text-embedding-3-small', description: 'Embedding model for document indexing', required: false },
    )
  } else if (fw === 'Agno') {
    baseConfig.push(
      { key: 'AGENT_MODE', type: 'string', default: 'reasoning', description: 'Agent execution mode: reasoning, tool_use, or mixed', required: false },
      { key: 'SHOW_TOOL_CALLS', type: 'boolean', default: 'true', description: 'Display tool call details in agent responses', required: false },
      { key: 'MARKDOWN_OUTPUT', type: 'boolean', default: 'true', description: 'Format agent responses as Markdown', required: false },
    )
  }

  return baseConfig
}

// ─── Getting Started Steps ───

function generateGettingStarted(agent: KnowledgeAgent): GettingStartedStep[] {
  const fw = agent.framework || 'LangGraph'
  const name = agent.name

  const steps: GettingStartedStep[] = [
    {
      step: 1,
      title: 'Install Dependencies',
      description: `Install the required Python packages for ${name}. This includes the ${fw} framework and any additional tools or integrations specified by the agent.`,
      code: fw === 'LangGraph' ? `pip install langgraph langchain-core langchain-openai` 
           : fw === 'CrewAI' ? `pip install crewai crewai-tools`
           : fw === 'AutoGen' ? `pip install pyautogen`
           : fw === 'LlamaIndex' ? `pip install llama-index llama-index-llms-openai`
           : `pip install agno`,
    },
    {
      step: 2,
      title: 'Set Environment Variables',
      description: 'Configure your API keys and environment variables. You will need an LLM provider API key and any integration-specific credentials.',
      code: `export OPENAI_API_KEY="sk-your-api-key-here"\n# Optional: Configure additional API keys\nexport ANTHROPIC_API_KEY="sk-ant-your-key"  # If using Claude\nexport TAVILY_API_KEY="tvly-your-key"      # If using web search`,
    },
    {
      step: 3,
      title: 'Initialize the Agent',
      description: `Create and configure ${name} with the appropriate settings for your use case. This step sets up the agent with its tools, memory, and reasoning configuration.`,
      code: fw === 'LangGraph' ? `from langgraph.prebuilt import create_react_agent\nfrom langchain_openai import ChatOpenAI\n\nmodel = ChatOpenAI(model="gpt-4o")\nagent = create_react_agent(\n    model=model,\n    tools=[...],  # Add your tools here\n    prompt="You are ${name}, an expert in ${agent.category || 'AI'}.",\n)`
           : fw === 'CrewAI' ? `from crewai import Agent, Task, Crew\n\nagent = Agent(\n    role="${agent.category || 'AI'} Specialist",\n    goal="Deliver expert-level ${agent.category || 'AI'} analysis",\n    backstory="You are ${name}, a ${agent.category || 'AI'} expert.",\n    allow_delegation=True,\n)`
           : fw === 'AutoGen' ? `import autogen\n\nassistant = autogen.AssistantAgent(\n    name="${name}",\n    llm_config={"model": "gpt-4o", "api_key": os.environ["OPENAI_API_KEY"]}\n)\nuser_proxy = autogen.UserProxyAgent(name="User")`
           : fw === 'LlamaIndex' ? `from llama_index.core import VectorStoreIndex, SimpleDirectoryReader\n\ndocuments = SimpleDirectoryReader("data/").load_data()\nindex = VectorStoreIndex.from_documents(documents)\nquery_engine = index.as_query_engine()`
           : `from agno.agent import Agent\nfrom agno.models.openai import OpenAIChat\n\nagent = Agent(\n    model=OpenAIChat(id="gpt-4o"),\n    description="You are ${name}, an expert in ${agent.category || 'AI'}.",\n)`,
    },
    {
      step: 4,
      title: 'Execute Your First Query',
      description: 'Run a test query to verify the agent is working correctly. Start with a simple request before moving to complex multi-step tasks.',
      code: fw === 'LangGraph' ? `result = agent.invoke(\n    {"messages": [{"role": "user", "content": "Analyze the current trends in ${agent.category || 'AI'} and provide key insights."}]}\n)\nprint(result["messages"][-1].content)`
           : fw === 'CrewAI' ? `task = Task(description="Analyze current ${agent.category || 'AI'} trends", agent=agent)\ncrew = Crew(agents=[agent], tasks=[task])\nresult = crew.kickoff()`
           : fw === 'AutoGen' ? `user_proxy.initiate_chat(\n    assistant,\n    message="Analyze the current trends in ${agent.category || 'AI'}.",\n)`
           : fw === 'LlamaIndex' ? `response = query_engine.query(\n    "What are the key insights from the data?"\n)\nprint(response)`
           : `agent.print_response("Analyze current ${agent.category || 'AI'} trends and provide insights.")`,
    },
    {
      step: 5,
      title: 'Customize & Deploy',
      description: `Customize ${name} for your specific use case by adding custom tools, modifying the system prompt, and configuring the execution parameters. Then deploy using your preferred method (Docker, serverless, or on-premises).`,
      code: `# Customize the agent configuration\nconfig = {\n    "temperature": 0.7,\n    "max_tokens": 4096,\n    "timeout": 120,\n}\n\n# Deploy with Docker (example)\n# docker build -t ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')} .\n# docker run -p 8000:8000 ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    },
  ]

  return steps
}

// ─── FAQ generation ───

function generateFAQ(agent: KnowledgeAgent): FAQItem[] {
  const fw = agent.framework || 'LangGraph'
  const cat = agent.category || 'AI/ML'
  const name = agent.name

  return [
    {
      question: `What is ${name} and what does it do?`,
      answer: `${name} is an AI agent built on the ${fw} framework, specialized in ${cat}. It combines advanced language model reasoning with domain-specific tools and knowledge to automate complex ${cat} tasks. It can process natural language instructions, execute multi-step workflows, leverage external tools and APIs, and produce structured, actionable outputs tailored to ${cat} use cases.`,
    },
    {
      question: `Which LLM models are supported?`,
      answer: `${name} supports multiple LLM providers including OpenAI (GPT-4, GPT-4o, GPT-3.5-turbo), Anthropic (Claude 3.5 Sonnet, Claude 3 Opus), Google (Gemini Pro), and open-source models through ${fw}'s model abstraction layer. The default model is ${agent.llm || 'GPT-4'}. You can switch models by updating the configuration without changing the agent logic.`,
    },
    {
      question: 'How do I handle rate limits and API costs?',
      answer: `Implement rate limiting through ${fw}'s built-in throttling mechanisms. For cost optimization: (1) Use GPT-3.5-turbo for simple tasks and GPT-4 for complex reasoning, (2) Set appropriate max_tokens limits, (3) Cache frequently requested results, (4) Use streaming for long responses to improve perceived performance. Typical costs range from $0.01-0.50 per request depending on complexity and model choice.`,
    },
    {
      question: `Can ${name} work with custom data sources?`,
      answer: `Yes. ${name} can be configured to connect to custom data sources through ${fw}'s tool and integration system. Common integrations include SQL databases, REST APIs, document stores, vector databases, and file systems. ${fw === 'LlamaIndex' ? 'As a LlamaIndex agent, it natively supports indexing and retrieving from custom document collections with support for 100+ data loaders.' : `You can create custom tool wrappers for any data source and register them with the agent.`}`,
    },
    {
      question: 'Is my data secure and private?',
      answer: `${name} processes data according to your deployment configuration. When self-hosted, all data remains within your infrastructure. API calls to LLM providers are encrypted in transit (TLS 1.3). ${fw} supports configurable data retention policies, PII redaction tools, and compliance with SOC 2, GDPR, and HIPAA requirements when properly configured. Review your LLM provider's data usage policies for cloud-based deployments.`,
    },
    {
      question: 'How do I debug agent behavior?',
      answer: `Enable verbose logging with the VERBOSE configuration option. ${fw} provides execution traces that show each reasoning step, tool call, and decision point. For ${fw === 'LangGraph' ? 'LangGraph, use LangSmith for detailed trace visualization and step-by-step debugging' : fw === 'CrewAI' ? 'CrewAI, enable crew verbose mode to see agent thinking and delegation decisions' : fw === 'AutoGen' ? 'AutoGen, use the logging module to capture full conversation histories' : 'the framework, check the agent execution logs'}, Common issues include: unclear prompts, insufficient tool descriptions, and context window limitations.`,
    },
    {
      question: `What are the scalability limitations?`,
      answer: `Scalability depends on your LLM provider API limits and infrastructure. Single-agent requests typically complete in 5-30 seconds. For high-throughput production deployments: (1) Implement request queuing and batching, (2) Use ${fw}'s async execution capabilities, (3) Deploy multiple agent instances behind a load balancer, (4) Cache common query patterns. The framework supports horizontal scaling for production workloads.`,
    },
  ]
}

// ─── Best Practices ───

function generateBestPractices(agent: KnowledgeAgent): BestPractice[] {
  const cat = agent.category || 'AI/ML'

  return [
    {
      title: 'Start with Clear, Specific Prompts',
      description: `The quality of ${cat} agent outputs is directly proportional to the specificity of your prompts. Instead of "analyze the data", use "analyze the Q4 revenue data from the e-commerce segment, identify the top 3 growth drivers, and quantify their individual contribution with 95% confidence intervals." The more context and constraints you provide, the more targeted and useful the output.`,
    },
    {
      title: 'Implement Progressive Complexity',
      description: `Begin with simple, well-defined tasks to validate the agent's understanding, then progressively increase complexity. This approach helps you identify and fix issues early, calibrate the agent's performance, and build confidence in its capabilities before entrusting it with critical ${cat} tasks.`,
    },
    {
      title: 'Validate Outputs with Domain Experts',
      description: `Always have ${cat} domain experts review agent outputs, especially in the early stages of deployment. Establish a feedback loop where expert corrections are incorporated into prompt refinements. Over time, this dramatically reduces the need for human review while maintaining quality.`,
    },
    {
      title: 'Design for Failure and Recovery',
      description: `Build resilient workflows that handle ${cat} agent failures gracefully. Implement retry logic with exponential backoff, fallback strategies when tools are unavailable, and human escalation paths for edge cases. Document known failure modes and their mitigations for operational readiness.`,
    },
    {
      title: 'Version and Track Agent Configurations',
      description: `Treat your agent configuration (prompts, tools, model settings) as code. Version control all configurations, track changes over time, and maintain the ability to rollback to previous versions. This is essential for debugging, compliance, and continuous improvement of your ${cat} agent.`,
    },
  ]
}

// ─── Limitations ───

function generateLimitations(agent: KnowledgeAgent): Limitation[] {
  const fw = agent.framework || 'LangGraph'
  const cat = agent.category || 'AI/ML'

  return [
    {
      title: 'Knowledge Cutoff & Hallucination Risk',
      description: `Like all LLM-based agents, ${agent.name} has a training data cutoff date and may produce confident but incorrect information (hallucinations). For ${cat} tasks requiring up-to-date data, always verify critical facts through external sources. Use retrieval-augmented generation (RAG) patterns to ground responses in verified data when possible.`,
    },
    {
      title: 'Context Window Constraints',
      description: `The agent is limited by the context window of its underlying LLM model. For ${cat} tasks involving large documents, extensive data analysis, or long conversation histories, the agent may lose important context. Implement chunking strategies and summarize intermediate results to stay within context limits.`,
    },
    {
      title: 'Determinism & Reproducibility',
      description: `LLM-based agents are inherently non-deterministic — the same input may produce different outputs across runs. For ${cat} applications requiring reproducible results (e.g., regulatory reporting, audit), implement seed-based generation, output caching, and validation checks to ensure consistency.`,
    },
    {
      title: 'Tool Dependency & Availability',
      description: `${agent.name} relies on external tools and APIs that may have their own availability constraints, rate limits, and latency characteristics. ${fw}-based workflows that depend on multiple tools can fail if any single tool is unavailable. Implement circuit breakers, fallback tools, and graceful degradation strategies.`,
    },
    {
      title: 'Cost Scaling at High Volume',
      description: `Each ${cat} agent request consumes LLM API tokens. For high-volume production deployments, costs can scale significantly. Implement cost monitoring, budget alerts, and optimization strategies like caching, model routing (use cheaper models for simple tasks), and batch processing where possible.`,
    },
  ]
}

// ─── Changelog ───

function generateChangelog(agent: KnowledgeAgent): ChangelogEntry[] {
  return [
    {
      version: '1.0.0',
      date: new Date().toISOString().split('T')[0],
      changes: [
        'Initial release of the curated agent detail page',
        'Comprehensive capabilities documentation',
        'Full-length Master Legendary prompt templates',
        'Architecture diagrams and configuration reference',
        'Getting started guide with code examples',
        'FAQ and best practices documentation',
      ],
    },
    {
      version: '0.9.0',
      date: '2025-01-15',
      changes: [
        'Beta release with core agent functionality',
        'Basic tool integration support',
        'Initial prompt templates',
        'Community feedback integration',
      ],
    },
    {
      version: '0.5.0',
      date: '2024-12-01',
      changes: [
        'Alpha release for internal testing',
        'Framework scaffolding and configuration',
        'Initial LLM integration',
      ],
    },
  ]
}

// ─── Use Cases ───

function generateUseCases(agent: KnowledgeAgent): UseCase[] {
  const cat = agent.category || 'AI/ML'
  const catLower = cat.toLowerCase()

  const useCaseTemplates: Record<string, UseCase[]> = {
    'Research': [
      { title: 'Systematic Literature Review', description: 'Conduct comprehensive literature reviews across academic databases, synthesize findings, identify research gaps, and produce publication-ready review documents.', industry: 'Academia & R&D', complexity: 'advanced' },
      { title: 'Market Intelligence Report', description: 'Aggregate and analyze market research data from multiple sources to produce competitive intelligence reports with actionable strategic recommendations.', industry: 'Business Strategy', complexity: 'moderate' },
      { title: 'Patent Landscape Analysis', description: 'Analyze patent databases to map technology landscapes, identify white spaces, and assess freedom-to-operate for new product development.', industry: 'IP & Legal', complexity: 'advanced' },
    ],
    'Data Analytics': [
      { title: 'Customer Churn Prediction', description: 'Build and deploy churn prediction models that identify at-risk customers 30-60 days before departure, enabling proactive retention campaigns.', industry: 'SaaS & Telecom', complexity: 'advanced' },
      { title: 'Sales Performance Dashboard', description: 'Create real-time dashboards tracking sales KPIs, pipeline health, and forecast accuracy with automated anomaly alerts and root cause analysis.', industry: 'Sales & Revenue', complexity: 'moderate' },
      { title: 'A/B Test Analysis Automation', description: 'Automate statistical analysis of A/B test results including sample size calculations, significance testing, and effect size estimation with visualization.', industry: 'Product & Marketing', complexity: 'simple' },
    ],
    'default': [
      { title: `${cat} Process Automation`, description: `Automate repetitive ${cat} workflows by orchestrating multi-step processes with intelligent decision-making, reducing manual effort by 60-80%.`, industry: cat, complexity: 'moderate' },
      { title: `${cat} Quality Assurance`, description: `Implement automated quality checks for ${cat} outputs using configurable validation rules, compliance requirements, and best practice guidelines.`, industry: cat, complexity: 'simple' },
      { title: `${cat} Strategic Advisory`, description: `Provide data-driven strategic recommendations for ${cat} initiatives by analyzing trends, benchmarking against best practices, and forecasting outcomes.`, industry: cat, complexity: 'advanced' },
    ],
  }

  // Find matching use cases
  for (const [key, cases] of Object.entries(useCaseTemplates)) {
    if (catLower.includes(key.toLowerCase()) || key.toLowerCase().includes(catLower)) {
      return cases
    }
  }

  return useCaseTemplates['default']!
}

// ─── Main export function ───

export function getAgentDetailData(agent: KnowledgeAgent): AgentDetailData {
  const cat = agent.category || 'AI/ML'
  const capabilities = categoryCapabilities[cat] || categoryCapabilities['AI/ML'] || categoryCapabilities['Research']!

  return {
    capabilities,
    useCases: generateUseCases(agent),
    masterPrompts: generateMasterPrompts(agent),
    architecture: frameworkArchitectures[agent.framework || ''] || defaultArchitecture,
    configuration: generateConfiguration(agent),
    gettingStarted: generateGettingStarted(agent),
    faq: generateFAQ(agent),
    bestPractices: generateBestPractices(agent),
    limitations: generateLimitations(agent),
    changelog: generateChangelog(agent),
  }
}
