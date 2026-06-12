'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ReadmeTabProps {
  readme: string
}

export function ReadmeTab({ readme }: ReadmeTabProps) {
  if (!readme) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>No README available for this agent.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> README
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{readme}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
