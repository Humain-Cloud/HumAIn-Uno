import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/chat - AI chat assistant for Humain-Uno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get the last user message to search for relevant agents
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const queryText = lastUserMessage?.content || ''

    // Search for relevant agents in the knowledge base based on query keywords
    const keywords = queryText
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .slice(0, 5)

    let relevantAgents: Array<{
      id: string
      name: string
      framework: string | null
      description: string
      category: string
      difficulty: string | null
      industry: string | null
    }> = []

    if (keywords.length > 0) {
      const searchResults = await db.knowledgeAgent.findMany({
        where: {
          OR: keywords.flatMap((keyword: string) => [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
            { tags: { contains: keyword } },
            { industry: { contains: keyword } },
            { category: { contains: keyword } },
            { framework: { contains: keyword } },
          ]),
        },
        take: 6,
        orderBy: { name: 'asc' },
      })

      relevantAgents = searchResults.map((a) => ({
        id: a.id,
        name: a.name,
        framework: a.framework,
        description: a.description,
        category: a.category,
        difficulty: a.difficulty,
        industry: a.industry,
      }))
    }

    // Build context from relevant agents
    const agentContext = relevantAgents.length > 0
      ? `Here are some relevant agents from the Humain-Uno knowledge base that may help answer the user's question:\n${relevantAgents.map((a, i) => `${i + 1}. "${a.name}" (Framework: ${a.framework || 'unknown'}, Category: ${a.category}, Difficulty: ${a.difficulty || 'N/A'}): ${a.description}`).join('\n')}`
      : 'No specific agents matched the query from the knowledge base.'

    // Framework knowledge for the system prompt
    const frameworkKnowledge = `
Key AI Agent Frameworks:
- **LangGraph**: Built on LangChain, uses graph-based state machines for complex agent workflows. Best for multi-step reasoning, cyclic agent loops, and stateful workflows. Python-based, open source, large community.
- **CrewAI**: Role-based multi-agent framework where agents collaborate as a "crew". Each agent has a role, goal, and backstory. Great for collaborative tasks, content creation, and research. Python-based, open source.
- **AutoGen** (Microsoft): Multi-agent conversation framework. Agents communicate through conversations/chat. Supports human-in-the-loop, code execution, and tool use. Python-based, open source, large community.
- **Agno**: Lightweight, fast framework for building AI agents with minimal code. Focus on simplicity and performance. Good for production deployments. Python-based, open source.
- **LlamaIndex**: Data framework for building LLM apps with RAG (Retrieval-Augmented Generation). Excellent for knowledge-intensive applications, document QA, and data indexing. Python/TypeScript, open source, large community.
`

    const systemPrompt = `You are an expert AI assistant for the Humain-Uno platform, a curated hub for discovering, comparing, and creating AI agents. You have deep knowledge of AI agent frameworks, architectures, and best practices.

Your role:
- Help users find the best AI agent for their use case from the knowledge base
- Explain and compare AI agent frameworks (LangGraph, CrewAI, AutoGen, Agno, LlamaIndex)
- Suggest agent architectures, tools, and configurations
- Provide practical advice on building AI agents
- Reference specific agents from the knowledge base when relevant

Guidelines:
- Be helpful, concise, and practical
- When suggesting agents, reference them by name and explain WHY they're a good fit
- When comparing frameworks, be balanced and mention trade-offs
- Use markdown formatting for better readability (bold, lists, code blocks)
- If you suggest specific agents from the knowledge base, mention them naturally in your response

${frameworkKnowledge}

${agentContext}

Respond in a friendly, expert tone. Keep responses focused and actionable.`

    // Build messages array for the LLM
    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: llmMessages,
      thinking: { type: 'disabled' },
    })

    // Extract the response text
    const responseText =
      completion?.choices?.[0]?.message?.content ||
      completion?.content ||
      (typeof completion === 'string' ? completion : '')

    if (!responseText) {
      return NextResponse.json({
        message: "I'm sorry, I couldn't generate a response. Please try again.",
        suggestedAgents: [],
      })
    }

    // Determine which agents to suggest based on the response
    // Include agents that are mentioned in the response or were found as relevant
    const suggestedAgents = relevantAgents.length > 0
      ? relevantAgents.slice(0, 3).map((a) => ({
          id: a.id,
          name: a.name,
          framework: a.framework,
          description: a.description,
        }))
      : []

    return NextResponse.json({
      message: responseText,
      suggestedAgents,
    })
  } catch (error) {
    console.error('[ai/chat] Error:', error)
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Please try again in a moment. In the meantime, feel free to browse our agent collection or check out the Knowledge Hub!",
      suggestedAgents: [],
    })
  }
}
