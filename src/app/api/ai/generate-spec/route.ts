import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/generate-spec - Generate agent specification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, framework, category, industry } = body

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Find top 3 similar knowledge agents for context
    const conditions: any[] = [
      { description: { contains: description } },
      { name: { contains: description } },
    ]

    if (framework) {
      conditions.push({ framework: { contains: framework } })
    }
    if (industry) {
      conditions.push({ industry: { contains: industry } })
    }

    const similarAgents = await db.knowledgeAgent.findMany({
      where: { OR: conditions },
      take: 3,
      orderBy: { name: 'asc' },
    })

    const parsedSimilar = similarAgents.map((a) => ({
      name: a.name,
      description: a.description,
      framework: a.framework,
      category: a.category,
      tools: JSON.parse(a.tools || '[]'),
      tags: JSON.parse(a.tags || '[]'),
      readme: a.readme.substring(0, 1000), // Truncate for context window
    }))

    const contextSection = parsedSimilar.length > 0
      ? `## Reference Agents from Knowledge Base\n${parsedSimilar.map((a, i) => `### ${i + 1}. ${a.name}\n- Framework: ${a.framework || 'N/A'}\n- Category: ${a.category}\n- Description: ${a.description}\n- Tools: ${a.tools.join(', ')}\n- Tags: ${a.tags.join(', ')}\n${a.readme ? `\nREADME excerpt:\n${a.readme}` : ''}`).join('\n\n')}`
      : ''

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert AI agent specification writer for the Humain-Uno platform. You generate comprehensive, production-ready agent specifications. You MUST respond with valid JSON only, no markdown, no extra text. The JSON must have this structure:
{
  "name": "string",
  "description": "string - comprehensive description",
  "category": "string",
  "framework": "string",
  "llm": "string - recommended LLM",
  "industry": "string",
  "difficulty": "beginner | intermediate | advanced",
  "language": "python | typescript",
  "tools": ["string"],
  "tags": ["string"],
  "features": ["string - key features the agent should have"],
  "architecture": "string - description of the agent architecture",
  "inputs": [{"name": "string", "type": "string", "description": "string"}],
  "outputs": [{"name": "string", "type": "string", "description": "string"}],
  "promptTemplate": "string - detailed system prompt",
  "errorHandling": "string - error handling strategy",
  "testing": "string - testing approach",
  "readme": "string - full markdown readme for the agent"
}`,
        },
        {
          role: 'user',
          content: `Generate a comprehensive agent specification based on:

**Name**: ${name || 'To be determined'}
**Description**: ${description}
**Framework**: ${framework || 'Suggest the best one'}
**Category**: ${category || 'Suggest the best one'}
**Industry**: ${industry || 'Suggest the best one'}

${contextSection}

Please generate a detailed, production-ready specification.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const responseText =
      completion?.choices?.[0]?.message?.content ||
      completion?.content ||
      (typeof completion === 'string' ? completion : JSON.stringify(completion))

    let specification
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText]
      specification = JSON.parse(jsonMatch[1] || responseText)
    } catch {
      specification = {
        name: name || 'Custom Agent',
        description,
        category: category || 'Automation',
        framework: framework || 'langgraph',
        llm: 'gpt-4o',
        industry: industry || 'General',
        difficulty: 'intermediate',
        language: 'python',
        tools: [],
        tags: [],
        features: [],
        architecture: 'Single agent with tool integration',
        inputs: [{ name: 'query', type: 'string', description: 'User input query' }],
        outputs: [{ name: 'response', type: 'string', description: 'Agent response' }],
        promptTemplate: `You are an AI assistant that helps with: ${description}`,
        errorHandling: 'Standard retry with exponential backoff',
        testing: 'Unit tests with mocked LLM responses',
        readme: responseText,
      }
    }

    return NextResponse.json({
      specification,
      references: parsedSimilar.map((a) => ({
        name: a.name,
        framework: a.framework,
        category: a.category,
      })),
    })
  } catch (error) {
    console.error('[ai/generate-spec] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate agent specification' },
      { status: 500 }
    )
  }
}
