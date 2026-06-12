import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'

interface AgentMetadata {
  title?: string
  description?: string
  author?: string
  language?: string
  framework?: string
  tags?: string[]
  industry?: string
  difficulty?: string
  llm?: string
  entrypoint?: string
  requirements?: string
}

function parseYamlSimple(content: string): AgentMetadata {
  const result: AgentMetadata = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (key === 'tags') {
      const match = val.match(/\[(.+)\]/)
      if (match) {
        result.tags = match[1].split(',').map(t => t.trim().replace(/['"]/g, ''))
      }
    } else {
      (result as any)[key] = val
    }
  }
  return result
}

// POST /api/admin/reindex - Re-index knowledge base from repo
export async function POST() {
  try {
    const REPO_PATH = path.resolve(process.cwd(), 'knowledge-base/500-agents-repo')
    const AGENTS_PATH = path.join(REPO_PATH, 'agents')

    if (!fs.existsSync(AGENTS_PATH)) {
      return NextResponse.json(
        { error: 'Agents directory not found at ' + AGENTS_PATH },
        { status: 500 }
      )
    }

    let agentsProcessed = 0
    let newAgents = 0
    let updatedAgents = 0

    // Seed from agents/ folder
    const agentDirs = fs.readdirSync(AGENTS_PATH).filter(name => {
      const fullPath = path.join(AGENTS_PATH, name)
      return fs.statSync(fullPath).isDirectory()
    })

    for (const dir of agentDirs) {
      const dirPath = path.join(AGENTS_PATH, dir)
      const metadataPath = path.join(dirPath, 'metadata.yaml')
      const readmePath = path.join(dirPath, 'README.md')
      const agentCodePath = path.join(dirPath, 'agent.py')

      let metadata: AgentMetadata = {}
      if (fs.existsSync(metadataPath)) {
        const yamlContent = fs.readFileSync(metadataPath, 'utf-8')
        metadata = parseYamlSimple(yamlContent)
      }

      let readme = ''
      if (fs.existsSync(readmePath)) {
        readme = fs.readFileSync(readmePath, 'utf-8')
      }

      let codeSnippet: string | null = null
      if (fs.existsSync(agentCodePath)) {
        const code = fs.readFileSync(agentCodePath, 'utf-8')
        const lines = code.split('\n')
        codeSnippet = lines.slice(0, 200).join('\n')
      }

      const name = metadata.title || dir.replace(/^\d+-/, '').replace(/-/g, ' ')
      const description = metadata.description || `AI Agent: ${name}`
      const tags = metadata.tags || []
      const framework = metadata.framework || null
      const llm = metadata.llm || null
      const industry = metadata.industry || null
      const difficulty = metadata.difficulty || null
      const language = metadata.language || null
      const author = metadata.author || null
      const category = industry || (tags.length > 0 ? tags[0] : 'general')

      const existingAgent = await db.knowledgeAgent.findUnique({
        where: { id: `kb-${dir}` },
      })

      try {
        await db.knowledgeAgent.upsert({
          where: { id: `kb-${dir}` },
          create: {
            id: `kb-${dir}`,
            name,
            category,
            description,
            tools: JSON.stringify(tags),
            models: JSON.stringify(llm ? [llm] : []),
            repoPath: `agents/${dir}`,
            readme,
            codeSnippet,
            framework,
            llm,
            industry,
            difficulty,
            language,
            tags: JSON.stringify(tags),
            author,
            isCurated: true,
          },
          update: {
            name,
            category,
            description,
            tools: JSON.stringify(tags),
            models: JSON.stringify(llm ? [llm] : []),
            repoPath: `agents/${dir}`,
            readme,
            codeSnippet,
            framework,
            llm,
            industry,
            difficulty,
            language,
            tags: JSON.stringify(tags),
            author,
          },
        })

        if (existingAgent) {
          updatedAgents++
        } else {
          newAgents++
        }
        agentsProcessed++
      } catch (err) {
        console.error(`Failed to upsert agent ${name}:`, err)
      }
    }

    // Also seed from README tables
    const readmePath = path.join(REPO_PATH, 'README.md')
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf-8')

      // Parse industry use cases
      const industrySection = readme.match(/## 🏭 Industry Use Cases[\s\S]*?(?=\n---|\n##)/)
      if (industrySection) {
        const rows = industrySection[0].match(/\| \*\*.*\*\* \|/g) || []
        for (const row of rows) {
          const cells = row.split('|').map(c => c.trim()).filter(Boolean)
          if (cells.length < 2) continue

          const agentName = cells[0].replace(/\*\*/g, '').trim()
          const industry = cells[1]?.trim() || 'General'
          const description = cells[2]?.trim() || ''
          const urlMatch = row.match(/https:\/\/github\.com\/[^\s)\]]+/)
          const sourceUrl = urlMatch ? urlMatch[0] : null

          const id = `kb-readme-${agentName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
          const existing = await db.knowledgeAgent.findUnique({ where: { id } })

          try {
            await db.knowledgeAgent.upsert({
              where: { id },
              create: {
                id,
                name: agentName,
                category: industry,
                description,
                tools: JSON.stringify([]),
                models: JSON.stringify([]),
                repoPath: 'README.md',
                readme: `# ${agentName}\n\n${description}\n\n${sourceUrl ? `Source: ${sourceUrl}` : ''}`,
                codeSnippet: null,
                framework: null,
                llm: null,
                industry,
                difficulty: null,
                language: null,
                tags: JSON.stringify([industry.toLowerCase()]),
                author: null,
                isCurated: true,
                sourceUrl,
              },
              update: {
                category: industry,
                description,
                sourceUrl,
              },
            })

            if (existing) {
              updatedAgents++
            } else {
              newAgents++
            }
            agentsProcessed++
          } catch (err) {
            // Skip duplicates
          }
        }
      }

      // Parse framework sections
      const frameworkSections = readme.match(/### (CrewAI|AutoGen|Agno|LangGraph|LlamaIndex)[\s\S]*?(?=\n---|\n### )/g) || []
      for (const section of frameworkSections) {
        const frameworkMatch = section.match(/### (\w+)/)
        const framework = frameworkMatch ? frameworkMatch[1] : 'Unknown'

        const rows = section.match(/\| [^|]+ \| [^|]+ \| [^|]+ \|/g) || []
        for (const row of rows) {
          if (row.includes('---') || row.includes('Use Case')) continue
          const cells = row.split('|').map(c => c.trim()).filter(Boolean)
          if (cells.length < 3) continue

          const agentName = cells[0].replace(/[^\w\s-]/g, '').trim()
          if (!agentName || agentName.length < 2) continue

          const industry = cells[1]?.trim() || 'General'
          const description = cells[2]?.trim() || ''
          const urlMatch = row.match(/https:\/\/[^\s)\]]+/)
          const sourceUrl = urlMatch ? urlMatch[0] : null

          const id = `kb-fw-${agentName.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)}`
          const existing = await db.knowledgeAgent.findUnique({ where: { id } })

          try {
            await db.knowledgeAgent.upsert({
              where: { id },
              create: {
                id,
                name: agentName,
                category: industry,
                description,
                tools: JSON.stringify([]),
                models: JSON.stringify([]),
                repoPath: 'README.md',
                readme: `# ${agentName}\n\n**Framework**: ${framework}\n\n${description}\n\n${sourceUrl ? `Source: ${sourceUrl}` : ''}`,
                codeSnippet: null,
                framework,
                llm: null,
                industry,
                difficulty: null,
                language: null,
                tags: JSON.stringify([framework.toLowerCase(), industry.toLowerCase()]),
                author: null,
                isCurated: true,
                sourceUrl,
              },
              update: {
                framework,
                industry,
                description,
              },
            })

            if (existing) {
              updatedAgents++
            } else {
              newAgents++
            }
            agentsProcessed++
          } catch (err) {
            // Skip duplicates
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      agentsProcessed,
      newAgents,
      updatedAgents,
    })
  } catch (error) {
    console.error('[admin/reindex] Error:', error)
    return NextResponse.json(
      { error: 'Re-index failed', details: String(error) },
      { status: 500 }
    )
  }
}
