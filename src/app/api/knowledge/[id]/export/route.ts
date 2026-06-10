import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const format = request.nextUrl.searchParams.get('format') || 'code'

    const agent = await db.knowledgeAgent.findUnique({ where: { id } })

    if (!agent) {
      return NextResponse.json(
        { error: 'Knowledge agent not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const tools = JSON.parse(agent.tools || '[]')
    const models = JSON.parse(agent.models || '[]')
    const tags = JSON.parse(agent.tags || '[]')

    if (format === 'markdown') {
      // Return README as markdown
      const content = agent.readme || `# ${agent.name}\n\n${agent.description}`
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.md"`,
        },
      })
    }

    if (format === 'zip') {
      // Return a simple README + code combined as a shell script / text bundle
      // (Since we can't easily create a zip without extra deps, we return a combined markdown doc)
      const combined = [
        `# ${agent.name}`,
        '',
        `**Framework:** ${agent.framework || 'N/A'}`,
        `**Category:** ${agent.category}`,
        `**Difficulty:** ${agent.difficulty || 'N/A'}`,
        `**Language:** ${agent.language || 'N/A'}`,
        `**Industry:** ${agent.industry || 'N/A'}`,
        `**LLM:** ${agent.llm || 'N/A'}`,
        `**Author:** ${agent.author || 'N/A'}`,
        '',
        '---',
        '',
        '## Description',
        '',
        agent.description,
        '',
        tools.length > 0 ? `## Tools\n\n${tools.map((t: string) => `- ${t}`).join('\n')}\n` : '',
        models.length > 0 ? `## Models\n\n${models.map((m: string) => `- ${m}`).join('\n')}\n` : '',
        tags.length > 0 ? `## Tags\n\n${tags.map((t: string) => `\`${t}\``).join(', ')}\n` : '',
        '---',
        '',
        '## README',
        '',
        agent.readme || 'No README available.',
        '',
        '---',
        '',
        '## Code',
        '',
        `\`\`\`${agent.language?.toLowerCase() || 'python'}`,
        agent.codeSnippet || '// No code available',
        '```',
      ].filter(Boolean).join('\n')

      return new NextResponse(combined, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}_bundle.md"`,
        },
      })
    }

    // Default: code format
    const code = agent.codeSnippet || ''
    if (!code) {
      // If no code snippet, redirect to markdown format
      const content = agent.readme || `# ${agent.name}\n\n${agent.description}`
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.md"`,
        },
      })
    }

    const ext = agent.language?.toLowerCase() === 'typescript' ? 'ts' : 'py'
    return new NextResponse(code, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}"`,
      },
    })
  } catch (error) {
    console.error('[knowledge/[id]/export] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    )
  }
}
