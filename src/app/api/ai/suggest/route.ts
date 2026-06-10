import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/suggest - Generate AI-powered agent suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description } = body

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Search for similar agents in the knowledge base
    const similarAgents = await db.knowledgeAgent.findMany({
      where: {
        OR: [
          { name: { contains: description } },
          { description: { contains: description } },
          { tags: { contains: description } },
          { industry: { contains: description } },
        ],
      },
      take: 5,
      orderBy: { name: 'asc' },
    })

    const parsedSimilar = similarAgents.map((a) => ({
      name: a.name,
      description: a.description,
      framework: a.framework,
      category: a.category,
      tools: JSON.parse(a.tools || '[]'),
      tags: JSON.parse(a.tags || '[]'),
    }))

    // Build context for AI
    const similarContext = parsedSimilar.length > 0
      ? `Here are some similar agents from our knowledge base for reference:\n${parsedSimilar.map((a, i) => `${i + 1}. "${a.name}" (${a.framework || 'unknown framework'}): ${a.description}`).join('\n')}`
      : 'No similar agents found in the knowledge base.'

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert AI agent architect for the Humain-Uno platform. You help users design AI agents by suggesting the best configuration based on their description. You MUST respond with valid JSON only, no markdown, no extra text. The JSON must have this structure:
{
  "name": "string - a catchy agent name",
  "description": "string - detailed description of what the agent does",
  "category": "string - one of: Research, Data Analysis, Content Creation, Customer Support, Development, Automation, Finance, Healthcare, Marketing, Education, Legal, HR",
  "framework": "string - one of: langgraph, crewai, autogen, agno, llamaindex",
  "llm": "string - recommended LLM like gpt-4o, claude-3.5-sonnet, etc.",
  "tools": ["string - list of tools/integrations the agent needs"],
  "codeScaffold": "string - a Python code scaffold showing the agent structure",
  "promptTemplate": "string - a system prompt template for the agent"
}`,
        },
        {
          role: 'user',
          content: `I want to create an AI agent with the following description:\n\n"${description}"\n\n${similarContext}\n\nPlease suggest the best agent configuration.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    // Extract the response text
    const responseText =
      completion?.choices?.[0]?.message?.content ||
      completion?.content ||
      (typeof completion === 'string' ? completion : JSON.stringify(completion))

    // Try to parse the AI response as JSON
    let suggestion
    try {
      // Try to extract JSON from the response (might have markdown fences)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText]
      suggestion = JSON.parse(jsonMatch[1] || responseText)
    } catch {
      // If parsing fails, return a structured fallback
      suggestion = {
        name: 'Custom Agent',
        description: description.trim(),
        category: 'Automation',
        framework: 'langgraph',
        llm: 'gpt-4o',
        tools: [],
        codeScaffold: responseText,
        promptTemplate: `You are an AI assistant that helps with: ${description.trim()}`,
      }
    }

    return NextResponse.json({
      suggestion,
      similarAgents: parsedSimilar,
    })
  } catch (error) {
    console.error('[ai/suggest] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI suggestion' },
      { status: 500 }
    )
  }
}
