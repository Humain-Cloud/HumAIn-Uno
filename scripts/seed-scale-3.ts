/**
 * Seed Scale Part 3: Adds 66 more agents to reach 808 total.
 * Run after parts 1 and 2: bun run scripts/seed-scale-3.ts
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient({ log: [] })

const frameworks = ['LangGraph', 'CrewAI', 'AutoGen', 'Agno', 'LlamaIndex'] as const
const llms = ['GPT-4o', 'GPT-4', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'Llama 3.1', 'Gemini Pro'] as const
let fi = 0, li = 0
const fw = () => frameworks[fi++ % frameworks.length]
const lm = () => llms[li++ % llms.length]
const rp = (f: string, c: string, s: string) => `agents/${f.toLowerCase().replace(' ','-')}/${c.toLowerCase().replace(/\s+/g,'-')}/${s}.py`
const sn = (cls: string, f: string, imp: string, body: string) => `from ${imp}\n\nclass ${cls}:\n    """${f}-powered agent for intelligent automation."""\n\n    def __init__(self, config):\n        self.config = config\n${body}\n\n    async def run(self, input_data):\n        return await self.process(input_data)`

type A = [string, string, string, string, string, string, boolean]

const agents: A[] = [
  // ── Software Development (+6, →28) ──
  ['APIGateway Designer','Software Development','Designs API gateway configurations by analyzing service architectures, authentication requirements, and rate limiting policies to generate optimized gateway rules that balance security with developer experience.','["Gateway SDK","Auth Configurator","Rate Limit Calculator"]','["api-gateway","authentication","rate-limiting","microservices"]','intermediate',false],
  ['DatabaseSchema Optimizer','Software Development','Optimizes database schemas by analyzing query patterns, indexing opportunities, and normalization requirements to recommend structural improvements that maximize query performance and data integrity.','["Schema Analyzer","Index Advisor","Query Profiler"]','["database","schema","indexing","optimization"]','advanced',false],
  ['DependencyAnalyzer Agent','Software Development','Analyzes software dependencies for security vulnerabilities, license compliance, and version currency across project dependency trees, recommending updates and replacements that reduce supply chain risk.','["Dependency Scanner","License Checker","Version Tracker"]','["dependencies","security","licenses","supply-chain"]','intermediate',false],
  ['PerformanceBenchmark Agent','Software Development','Benchmarks application performance by generating load tests, measuring latency distributions, and comparing results against baseline thresholds to identify regressions and validate optimization efforts.','["Load Generator","Latency Analyzer","Regression Detector"]','["performance","benchmark","load-testing","latency"]','intermediate',false],
  ['ErrorHandler Designer','Software Development','Designs error handling strategies by analyzing failure modes, categorizing exceptions, and implementing resilient patterns including circuit breakers, retries, and graceful degradation for robust application behavior.','["Failure Mode Analyzer","Circuit Breaker SDK","Retry Engine"]','["error-handling","resilience","circuit-breaker","graceful-degradation"]','intermediate',false],
  ['LocalizationManager Agent','Software Development','Manages software localization by extracting translatable strings, managing translation memories, and validating locale-specific formatting for internationalized applications across 40+ languages.','["String Extractor","Translation Memory","Locale Validator"]','["localization","i18n","translation","formatting"]','beginner',false],

  // ── Productivity (+4, →22) ──
  ['EmailTriage Agent','Productivity','Triages email overload by categorizing messages by urgency and actionability, suggesting quick replies for routine inquiries, and scheduling follow-up reminders for messages requiring thoughtful responses.','["Email Parser","Urgency Scorer","Reply Suggester"]','["email","triage","urgency","follow-up"]','beginner',false],
  ['GoalTracker Agent','Productivity','Tracks goal progress by breaking objectives into milestones, monitoring completion metrics, and generating progress reports with motivation insights that maintain momentum toward personal and professional goals.','["Milestone Tracker","Progress Calculator","Motivation Engine"]','["goals","tracking","milestones","motivation"]','beginner',false],
  ['TimeTracker Analyzer','Productivity','Analyzes time tracking data to identify productivity patterns, categorize effort allocation across projects, and recommend schedule adjustments that align daily activities with priority objectives.','["Time Categorizer","Pattern Detector","Schedule Optimizer"]','["time-tracking","productivity","patterns","priorities"]','beginner',false],
  ['HabitBuilder Agent','Productivity','Builds productive habits by designing streak-based tracking systems, generating accountability reminders, and analyzing consistency patterns to help users establish and maintain beneficial daily routines.','["Streak Tracker","Reminder Engine","Consistency Analyzer"]','["habits","streaks","consistency","routines"]','beginner',false],

  // ── Research (+4, →22) ──
  ['PatentAnalyzer Agent','Research','Analyzes patent landscapes by searching intellectual property databases, mapping technology domains, and identifying freedom-to-operate boundaries for research-driven innovation strategy.','["Patent Search API","Technology Mapper","FTO Analyzer"]','["patents","ip","freedom-to-operate","innovation"]','advanced',false],
  ['ResearchGrant Matcher','Research','Matches researchers with funding opportunities by analyzing proposal topics, investigator profiles, and program priorities against available grant announcements to maximize application success rates.','["Grant DB","Profile Matcher","Priority Analyzer"]','["grants","funding","proposals","matching"]','intermediate',false],
  ['DataReproducibility Checker','Research','Checks research data reproducibility by validating statistical methods, verifying analysis code, and comparing reported results against independent computational verification for scientific integrity assurance.','["Stat Validator","Code Verifier","Result Comparator"]','["reproducibility","integrity","verification","science"]','intermediate',false],
  ['CollaborationMatcher Agent','Research','Matches researchers for collaboration by analyzing expertise complementarity, shared interests, and network proximity to recommend partnership opportunities that advance interdisciplinary research.','["Expertise Analyzer","Interest Matcher","Network Optimizer"]','["collaboration","interdisciplinary","matching","networks"]','beginner',false],

  // ── Media (+4, →22) ──
  ['ContentCalendar Agent','Media','Manages editorial content calendars by analyzing publishing frequency, audience engagement patterns, and content mix requirements to schedule posts that maintain consistent brand presence across platforms.','["Calendar Optimizer","Frequency Analyzer","Mix Balancer"]','["editorial","calendar","scheduling","consistency"]','beginner',false],
  ['VideoAnalytics Agent','Media','Analyzes video content performance by processing view duration, engagement curves, and audience retention metrics to recommend editing optimizations and content strategies for maximum viewer retention.','["Retention Analyzer","Engagement Curver","Editing Optimizer"]','["video","analytics","retention","engagement"]','intermediate',false],
  ['PodcastOptimizer Agent','Media','Optimizes podcast production by analyzing episode performance, listener drop-off patterns, and topic preferences to recommend episode lengths, format choices, and guest selections that grow audience.','["Episode Analyzer","Drop-off Detector","Topic Scorer"]','["podcast","optimization","retention","growth"]','beginner',false],
  ['SocialListening Agent','Media','Performs social listening by monitoring brand mentions, trending topics, and sentiment shifts across platforms to identify emerging conversations and inform reactive and proactive media strategies.','["Mention Tracker","Trend Detector","Sentiment Monitor"]','["social-listening","mentions","trends","sentiment"]','intermediate',false],

  // ── Communication (+3, →21) ──
  ['TechnicalWriting Agent','Communication','Assists technical writing by analyzing subject matter, structuring documentation hierarchies, and generating clear instructional content that makes complex technical concepts accessible to target audiences.','["Structure Analyzer","Readability Scorer","Content Generator"]','["technical-writing","documentation","readability","instruction"]','intermediate',false],
  ['FeedbackSynthesis Agent','Communication','Synthesizes feedback from multiple sources by categorizing themes, identifying consensus and outliers, and generating prioritized action summaries that transform raw feedback into actionable improvements.','["Theme Categorizer","Consensus Detector","Priority Ranker"]','["feedback","synthesis","priorities","action"]','beginner',false],
  ['NegotiationPrep Agent','Communication','Prepares negotiation strategies by analyzing counterparty positions, identifying mutual interests, and generating talking points with fallback positions that optimize outcomes while maintaining relationship quality.','["Position Analyzer","Interest Mapper","Talking Point Generator"]','["negotiation","strategy","positions","outcomes"]','intermediate',false],

  // ── Data Analytics (+4, →22) ──
  ['ETLPipeline Builder','Data Analytics','Builds ETL pipelines by analyzing source data structures, transformation requirements, and destination schemas to generate configurable data integration workflows with error handling and monitoring.','["Schema Analyzer","Transform Generator","Pipeline Orchestrator"]','["etl","pipeline","integration","data-engineering"]','intermediate',false],
  ['RealTimeAnalytics Agent','Data Analytics','Enables real-time analytics by processing streaming data through windowed aggregations, anomaly detection, and alert generation for live operational monitoring and instant business intelligence.','["Stream Processor","Window Aggregator","Alert Engine"]','["real-time","streaming","aggregation","monitoring"]','advanced',false],
  ['DataCatalog Builder','Data Analytics','Builds data catalogs by automatically discovering datasets, extracting metadata, classifying sensitivity levels, and generating searchable documentation that improves data discovery and governance across organizations.','["Discovery Engine","Metadata Extractor","Sensitivity Classifier"]','["data-catalog","metadata","discovery","governance"]','intermediate',false],
  ['ABTestAnalyzer Agent','Data Analytics','Analyzes A/B test results with statistical rigor by calculating effect sizes, confidence intervals, and Bayesian posterior probabilities, recommending decisions with quantified uncertainty for product experimentation.','["Bayesian Engine","Effect Calculator","Decision Recommender"]','["ab-testing","bayesian","experimentation","decision"]','intermediate',false],

  // ── Finance (+3, →21) ──
  ['KYCVerifier Agent','Finance','Verifies know-your-customer requirements by analyzing identity documents, screening against sanctions lists, and assessing risk profiles to streamline onboarding while maintaining regulatory compliance.','["Document Verifier","Sanctions Screener","Risk Profiler"]','["kyc","compliance","onboarding","sanctions"]','intermediate',false],
  ['TreasuryManagement Agent','Finance','Manages treasury operations by forecasting cash positions, optimizing liquidity allocation, and recommending investment strategies for surplus funds that balance return objectives with operational needs.','["Cash Forecaster","Liquidity Optimizer","Investment Advisor"]','["treasury","liquidity","cash-management","investment"]','advanced',false],
  ['VentureCapital Analyst','Finance','Analyzes venture capital opportunities by evaluating startup traction metrics, market sizing, and team strength to generate investment memoranda with risk assessments and return projections for VC decision-making.','["Traction Analyzer","Market Sizer","Team Evaluator"]','["venture-capital","startups","investment","evaluation"]','advanced',false],

  // ── Human Resources (+3, →21) ──
  ['OnboardingAutomation Agent','Human Resources','Automates employee onboarding by generating personalized welcome sequences, provisioning system access, and scheduling orientation activities that accelerate new hire integration and productivity.','["Welcome Generator","Access Provisioner","Schedule Builder"]','["onboarding","automation","provisioning","integration"]','beginner',false],
  ['CompensationBenchmark Agent','Human Resources','Benchmarks compensation packages by analyzing market salary data, benefits comparisons, and equity structures to recommend competitive total compensation that attracts and retains talent within budget constraints.','["Salary DB","Benefits Analyzer","Equity Modeler"]','["compensation","benchmarking","salary","equity"]','intermediate',false],
  ['WellnessProgram Coordinator','Human Resources','Coordinates employee wellness programs by analyzing participation data, health risk assessments, and engagement patterns to recommend program improvements that improve employee health outcomes and reduce healthcare costs.','["Participation Tracker","Risk Assessor","Program Optimizer"]','["wellness","health","engagement","programs"]','beginner',false],

  // ── Business (+4, →22) ──
  ['SWOTAnalyzer Agent','Business','Performs SWOT analysis by examining internal capabilities and external market conditions to identify strategic strengths, weaknesses, opportunities, and threats with actionable recommendations for competitive positioning.','["Capability Assessor","Market Analyzer","Strategy Recommender"]','["swot","analysis","strategy","positioning"]','beginner',false],
  ['RevenueOptimizer Agent','Business','Optimizes revenue streams by analyzing pricing elasticity, customer lifetime value, and channel performance to recommend pricing strategies and revenue model adjustments that maximize top-line growth.','["Elasticity Analyzer","LTV Calculator","Pricing Optimizer"]','["revenue","pricing","elasticity","growth"]','intermediate',false],
  ['VendorManagement Agent','Business','Manages vendor relationships by tracking contract terms, performance SLAs, and renewal timelines to negotiate favorable terms and ensure service delivery meets organizational requirements and budget constraints.','["Contract Tracker","SLA Monitor","Negotiation Advisor"]','["vendor","contracts","sla","procurement"]','intermediate',false],
  ['DigitalTransformation Agent','Business','Plans digital transformation initiatives by assessing organizational readiness, identifying automation opportunities, and recommending technology investments that modernize operations while managing change risk.','["Readiness Assessor","Opportunity Identifier","Investment Planner"]','["digital-transformation","modernization","automation","change"]','advanced',false],

  // ── Marketing (+2, →20) ──
  ['ConversionRate Optimizer','Marketing','Optimizes conversion rates by analyzing funnel analytics, conducting multivariate test designs, and implementing behavioral psychology principles to improve landing page and checkout flow performance.','["Funnel Analyzer","Test Designer","Psychology Engine"]','["conversion","optimization","funnel","behavioral"]','intermediate',false],
  ['LoyaltyProgram Designer','Marketing','Designs customer loyalty programs by analyzing purchase frequency, reward preferences, and competitive offerings to create tiered reward structures that increase retention and customer lifetime value.','["Frequency Analyzer","Preference Mapper","Tier Designer"]','["loyalty","rewards","retention","lifetime-value"]','intermediate',false],

  // ── DevOps (+2, →20) ──
  ['ChaosEngineering Agent','DevOps','Orchestrates chaos engineering experiments by defining failure scenarios, executing controlled disruptions, and measuring system resilience to validate reliability assumptions and improve failure tolerance in production systems.','["Scenario Designer","Disruption Executor","Resilience Measurer"]','["chaos-engineering","reliability","resilience","experiments"]','advanced',false],
  ['GitOpsManager Agent','DevOps','Manages GitOps workflows by synchronizing Git repository declarations with cluster state, automating drift detection and reconciliation, and providing audit trails for infrastructure change management.','["Git Sync Engine","Drift Detector","Reconciliation Manager"]','["gitops","drift","reconciliation","audit"]','intermediate',false],

  // ── Gaming (+2, →20) ──
  ['GameEconomy Simulator','Gaming','Simulates in-game economies by modeling currency flows, item creation and destruction rates, and player trading patterns to test economic policies before deployment and prevent hyperinflation or deflation.','["Currency Modeler","Trade Simulator","Policy Tester"]','["economy","simulation","currency","balance"]','advanced',false],
  ['PlayerSegmentation Agent','Gaming','Segments player populations by analyzing behavior patterns, spending habits, and engagement styles to create targeted experiences and communications that improve retention and monetization for each player segment.','["Behavior Clusterer","Spending Analyzer","Engagement Profiler"]','["segmentation","players","behavior","targeting"]','intermediate',false],

  // ── Food (+2, →20) ──
  ['FoodTraceability Agent','Food','Manages food traceability from farm to table by tracking lot numbers, processing records, and distribution chains to ensure rapid recall capability and supply chain transparency for consumer safety.','["Lot Tracker","Chain Validator","Recall Coordinator"]','["traceability","recall","supply-chain","safety"]','intermediate',false],
  ['FoodRegulation Compliance','Food','Ensures food regulation compliance by tracking label requirements, health claims regulations, and additive restrictions across jurisdictions to generate compliant packaging and marketing materials.','["Regulation DB","Label Checker","Claims Validator"]','["regulation","compliance","labeling","claims"]','intermediate',false],

  // ── Agriculture (+2, →20) ──
  ['PrecisionSpraying Agent','Agriculture','Manages precision spraying operations by analyzing field maps, pest pressure data, and weather conditions to optimize application rates and timing, reducing chemical usage while maintaining crop protection efficacy.','["Field Mapper","Pressure Analyzer","Rate Optimizer"]','["spraying","precision","chemicals","optimization"]','intermediate',false],
  ['CropRotation Planner','Agriculture','Plans crop rotation schedules by analyzing soil health data, pest cycles, and market prices to recommend multi-year rotation sequences that maintain soil fertility and break pest cycles profitably.','["Soil Analyzer","Cycle Mapper","Price Forecaster"]','["crop-rotation","soil-health","pest-cycles","planning"]','beginner',false],

  // ── Cybersecurity (+2, →20) ──
  ['SecurityTraining Simulator','Cybersecurity','Simulates security incident scenarios for training purposes by generating realistic attack narratives, presenting decision points, and evaluating response effectiveness to improve team readiness for actual security events.','["Scenario Generator","Decision Evaluator","Readiness Scorer"]','["training","simulation","incident","readiness"]','intermediate',false],
  ['DataLossPrevention Agent','Cybersecurity','Prevents data loss by monitoring data flows, detecting sensitive information exfiltration patterns, and enforcing content policies across email, cloud storage, and endpoint channels for regulatory compliance.','["Content Inspector","Flow Monitor","Policy Enforcer"]','["dlp","data-loss","exfiltration","compliance"]','advanced',false],

  // ── Education (+2, →20) ──
  ['MicrolearningGenerator Agent','Education','Generates microlearning content by breaking complex topics into bite-sized modules with spaced repetition scheduling, interactive quizzes, and progress tracking for efficient knowledge retention in corporate training.','["Topic Decomposer","Quiz Generator","Spaced Repetition Engine"]','["microlearning","spaced-repetition","quizzes","training"]','beginner',false],
  ['CredentialVerifier Agent','Education','Verifies academic and professional credentials by cross-referencing institution databases, checking accreditation status, and validating certificate authenticity for employer background checks and admissions processes.','["Institution DB","Accreditation Checker","Certificate Validator"]','["credentials","verification","accreditation","background-checks"]','intermediate',false],

  // ── Healthcare (+2, →20) ──
  ['PatientEngagement Agent','Healthcare','Improves patient engagement by analyzing communication preferences, appointment adherence patterns, and health literacy levels to generate personalized outreach that encourages preventive care and chronic disease management.','["Preference Analyzer","Adherence Tracker","Outreach Generator"]','["patient-engagement","outreach","adherence","prevention"]','intermediate',false],
  ['ClinicalDecisionSupport Agent','Healthcare','Provides clinical decision support at point of care by integrating patient data with evidence-based guidelines, drug interaction databases, and diagnostic algorithms to assist providers in making informed treatment decisions.','["Guideline Engine","Interaction DB","Diagnostic Algorithm"]','["clinical-decision","evidence-based","guidelines","point-of-care"]','advanced',false],

  // ── E-commerce (+1, →19) ──
  ['MarketplaceOptimizer Agent','E-commerce','Optimizes marketplace seller performance by analyzing competitive positioning, fulfillment metrics, and advertising ROI to recommend listing optimizations and pricing strategies that improve buy box winning and sales velocity.','["Listing Analyzer","Pricing Optimizer","Ad ROI Calculator"]','["marketplace","seller","buy-box","optimization"]','intermediate',false],

  // ── Energy (+1, →19) ──
  ['GridModernization Planner','Energy','Plans grid modernization initiatives by assessing infrastructure age, technology readiness, and regulatory requirements to recommend investment priorities for smart grid deployment and renewable integration.','["Infrastructure Assessor","Technology Readiness Evaluator","Investment Planner"]','["grid-modernization","smart-grid","investment","infrastructure"]','advanced',false],

  // ── Supply Chain (+1, →19) ──
  ['NetworkDesign Optimizer','Supply Chain','Optimizes supply chain network design by analyzing facility locations, transportation costs, and service requirements to recommend optimal distribution center placement and flow paths for cost-effective fulfillment.','["Location Optimizer","Cost Modeler","Service Calculator"]','["network-design","optimization","facilities","distribution"]','advanced',false],

  // ── Real Estate (+1, →19) ──
  ['GreenBuilding Advisor','Real Estate','Advises on green building improvements by analyzing energy consumption, water usage, and indoor air quality to recommend sustainability upgrades with payback calculations and certification pathway guidance.','["Energy Analyzer","Water Auditor","Certification Planner"]','["green-building","sustainability","certification","upgrades"]','intermediate',false],

  // ── Legal (+1, →19) ──
  ['LegalTech Innovator','Legal','Identifies legal technology innovation opportunities by analyzing practice workflows, technology capabilities, and market gaps to recommend automation and AI solutions that improve legal service delivery efficiency.','["Workflow Analyzer","Gap Identifier","Solution Recommender"]','["legaltech","innovation","automation","efficiency"]','intermediate',false],

  // ── Travel (+1, →19) ──
  ['LoyaltyProgram Agent','Travel','Optimizes travel loyalty programs by analyzing member behavior, redemption patterns, and competitive offerings to recommend tier structures and benefit improvements that increase program engagement and revenue contribution.','["Behavior Analyzer","Redemption Optimizer","Competitive Intelligence"]','["loyalty","rewards","travel","engagement"]','intermediate',false],
]

async function seed() {
  let count = 0
  for (const a of agents) {
    const [name, category, description, tools, tags, difficulty, featured] = a
    const framework = fw()
    const llm = lm()
    const industry = category
    const className = name.replace(/\s+/g, '')
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const repoPath = rp(framework, category, slug)
    const readme = `## ${name}\n\n${description}\n\n### Framework: ${framework}\n\n### Tools\n${tools}\n\n### Tags\n${tags}`
    const codeSnippet = sn(className, framework,
      framework === 'LangGraph' ? 'langgraph.graph import StateGraph' :
      framework === 'CrewAI' ? 'crewai import Agent' :
      framework === 'AutoGen' ? 'autogen import AssistantAgent' :
      framework === 'Agno' ? 'agno import Agent' :
      'llama_index import VectorStoreIndex',
      `        self.tools = ${tools}\n        self.tags = ${tags}`)

    try {
      await db.knowledgeAgent.create({
        data: {
          name, category, description, tools, models: '["gpt-4o"]',
          repoPath, readme, codeSnippet, framework, llm, industry,
          difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
          language: 'Python', tags, author: `${category}AI Labs`,
          isCurated: true, featured,
        }
      })
      count++
    } catch (e: any) {
      console.log(`⚠ Skip: ${name} - ${e.message?.slice(0,60)}`)
    }
  }
  console.log(`\n✅ Part 3: Seeded ${count} agents`)
  console.log(`   Total should now be ~${742 + count}`)
}

seed().catch(console.error).finally(() => db.$disconnect())
