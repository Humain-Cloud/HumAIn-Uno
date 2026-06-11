'use client'

import { CodePlayground } from '@/components/agents/code-playground'

interface CodeTabProps {
  code: string
  language: string
  agentName: string
}

export function CodeTab({ code, language, agentName }: CodeTabProps) {
  return (
    <CodePlayground
      code={code}
      language={language}
      agentName={agentName}
    />
  )
}
