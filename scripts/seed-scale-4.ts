/**
 * Seed Scale Part 4: Final 9 agents to reach 808.
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient({ log: [] })

const frameworks = ['LangGraph', 'CrewAI', 'AutoGen', 'Agno', 'LlamaIndex'] as const
const llms = ['GPT-4o', 'GPT-4', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'Llama 3.1', 'Gemini Pro'] as const
let fi = 0, li = 0
const fw = () => frameworks[fi++ % frameworks.length]
const lm = () => llms[li++ % llms.length]

const agents = [
  ['PredictiveMaintenance Smart','Manufacturing','Predicts equipment failures by analyzing vibration signatures, thermal patterns, and operational stress cycles to schedule maintenance before breakdowns occur, reducing unplanned downtime and extending asset life.','["Vibration Analyzer","Thermal Monitor","Stress Calculator"]','["predictive-maintenance","vibration","thermal","downtime"]','advanced',true],
  ['QualityControl Vision','Manufacturing','Performs automated quality control by analyzing product images against specification standards, detecting surface defects, dimensional deviations, and assembly errors with sub-millimeter precision for zero-defect manufacturing.','["Computer Vision","Defect Detector","Dimension Analyzer"]','["quality-control","vision","defects","precision"]','advanced',false],
  ['ProductionScheduler Smart','Manufacturing','Schedules production runs by balancing machine capabilities, material availability, and order priorities to maximize throughput while minimizing changeover times and work-in-progress inventory.','["Capacity Planner","Changeover Optimizer","Priority Manager"]','["scheduling","production","throughput","changeover"]','intermediate',false],
  ['SupplyChain Pharma','Pharmaceutical','Manages pharmaceutical supply chains with temperature-controlled logistics, serialization tracking, expiry management, and demand forecasting to ensure drug availability while minimizing waste from expired inventory.','["Cold Chain Monitor","Serialization Tracker","Expiry Manager"]','["supply-chain","cold-chain","serialization","pharma"]','intermediate',false],
  ['ClinicalData Manager','Pharmaceutical','Manages clinical trial data by ensuring data integrity, validating edit checks, and maintaining audit trails in compliance with 21 CFR Part 11 for regulatory-ready electronic records.','["Data Validator","Audit Trail Engine","CFR11 Compliance"]','["clinical-data","integrity","audit","regulatory"]','intermediate',false],
  ['SpaceDebrisRemoval Planner','Space Commerce','Plans active debris removal missions by assessing target object characteristics, rendezvous feasibility, and de-orbit delta-v requirements, estimating costs and regulatory pathways for orbital cleanup ventures.','["Debris Catalog","Rendezvous Planner","Cost Estimator"]','["debris","remediation","active-removal","orbital-cleanup"]','advanced',false],
  ['SpaceResource Economist','Space Commerce','Evaluates space resource extraction economics by analyzing mission costs, resource values, and market demand for materials including water ice and rare minerals from lunar and asteroid sources.','["Cost Analyzer","Resource Valuer","Market Modeler"]','["space-resources","economics","lunar","asteroid"]','advanced',false],
  ['SpaceRegulatory Navigator','Space Commerce','Navigates space regulatory requirements by analyzing licensing procedures, frequency coordination, and liability frameworks across national and international space law for commercial space venture compliance.','["Regulation DB","License Tracker","Liability Analyzer"]','["regulatory","space-law","licensing","compliance"]','intermediate',false],
  ['SatelliteData Broker','Space Commerce','Brokers satellite data transactions by matching customer requirements for resolution, coverage, and latency with available satellite assets, optimizing contract terms for earth observation data markets.','["Requirement Matcher","Asset Catalog","Contract Optimizer"]','["satellite-data","brokerage","earth-observation","contracts"]','intermediate',false],
]

async function seed() {
  let count = 0
  for (const [name, category, description, tools, tags, difficulty, featured] of agents as [string,string,string,string,string,string,boolean][]) {
    const framework = fw()
    const llm = lm()
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const repoPath = `agents/${framework.toLowerCase().replace(' ','-')}/${category.toLowerCase().replace(/\s+/g,'-')}/${slug}.py`
    const className = name.replace(/\s+/g, '')
    const readme = `## ${name}\n\n${description}\n\n### Framework: ${framework}\n\n### Tools\n${tools}\n\n### Tags\n${tags}`
    const imp = framework === 'LangGraph' ? 'langgraph.graph import StateGraph' : framework === 'CrewAI' ? 'crewai import Agent' : framework === 'AutoGen' ? 'autogen import AssistantAgent' : framework === 'Agno' ? 'agno import Agent' : 'llama_index import VectorStoreIndex'
    const codeSnippet = `from ${imp}\n\nclass ${className}:\n    """${framework}-powered agent for intelligent automation."""\n\n    def __init__(self, config):\n        self.config = config\n        self.tools = ${tools}\n        self.tags = ${tags}\n\n    async def run(self, input_data):\n        return await self.process(input_data)`

    try {
      await db.knowledgeAgent.create({
        data: { name, category, description, tools, models: '["gpt-4o"]', repoPath, readme, codeSnippet, framework, llm, industry: category, difficulty: difficulty as 'beginner'|'intermediate'|'advanced', language: 'Python', tags, author: `${category}AI Labs`, isCurated: true, featured }
      })
      count++
    } catch (e: any) { console.log(`⚠ Skip: ${name}`) }
  }
  console.log(`\n✅ Part 4: Seeded ${count} agents. Grand total should be ~${799 + count}`)
}

seed().catch(console.error).finally(() => db.$disconnect())
