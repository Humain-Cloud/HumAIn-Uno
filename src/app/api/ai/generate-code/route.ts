import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/generate-code - Generate code scaffold
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specification, framework, language, name } = body

    if (!specification && !name) {
      return NextResponse.json(
        { error: 'Specification or agent name is required' },
        { status: 400 }
      )
    }

    const specText = typeof specification === 'string'
      ? specification
      : JSON.stringify(specification, null, 2)

    const targetFramework = framework || specification?.framework || 'langgraph'
    const targetLanguage = language || specification?.language || 'python'

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are an expert AI agent developer for the Humain-Uno platform. You generate production-ready code scaffolds for AI agents using various frameworks. You MUST respond with valid JSON only, no markdown, no extra text. The JSON must have this structure:
{
  "files": [
    {
      "name": "string - filename (e.g., main.py, agent.py, config.yaml)",
      "path": "string - file path relative to project root",
      "content": "string - full file content",
      "description": "string - brief description of what this file does"
    }
  ],
  "dependencies": ["string - pip/npm packages needed"],
  "setupInstructions": "string - how to set up and run the agent",
  "envVars": [{"name": "string", "description": "string", "required": "boolean"}]
}`,
        },
        {
          role: 'user',
          content: `Generate a complete code scaffold for an AI agent with the following specification:

**Agent Name**: ${name || specification?.name || 'Custom Agent'}
**Framework**: ${targetFramework}
**Language**: ${targetLanguage}

**Specification**:
${specText}

Generate all the necessary files to create a working agent scaffold. Include:
1. Main agent file with the agent definition
2. Configuration file
3. Requirements/dependencies file
4. README with setup instructions
5. Any supporting utility files

Make the code production-quality with proper error handling, logging, and documentation.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const responseText =
      completion?.choices?.[0]?.message?.content ||
      completion?.content ||
      (typeof completion === 'string' ? completion : JSON.stringify(completion))

    let result
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText]
      result = JSON.parse(jsonMatch[1] || responseText)
    } catch {
      // Fallback: return the raw response as a single file
      result = {
        files: [
          {
            name: targetLanguage === 'python' ? 'main.py' : 'main.ts',
            path: targetLanguage === 'python' ? 'main.py' : 'src/main.ts',
            content: responseText,
            description: `Main ${targetFramework} agent implementation`,
          },
        ],
        dependencies: targetFramework === 'langgraph'
          ? ['langgraph', 'langchain', 'langchain-openai']
          : targetFramework === 'crewai'
            ? ['crewai', 'langchain']
            : targetFramework === 'autogen'
              ? ['autogen-agentchat', 'autogen-core']
              : ['agno'],
        setupInstructions: `1. Install dependencies: pip install -r requirements.txt\n2. Set up environment variables\n3. Run: ${targetLanguage === 'python' ? 'python main.py' : 'npx ts-node src/main.ts'}`,
        envVars: [
          { name: 'OPENAI_API_KEY', description: 'OpenAI API key for LLM access', required: true },
        ],
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[ai/generate-code] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate code scaffold' },
      { status: 500 }
    )
  }
}
