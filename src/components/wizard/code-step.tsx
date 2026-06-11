'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Eye,
  Check,
  Copy,
  Download,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CodeStepProps {
  wizardData: Record<string, any>
  setWizardData: (data: Record<string, any>) => void
  codePreviewCode: string
  codeCopied: boolean
  setCodeCopied: (copied: boolean) => void
}

export function CodeStep({
  wizardData,
  setWizardData,
  codePreviewCode,
  codeCopied,
  setCodeCopied,
}: CodeStepProps) {
  const { toast } = useToast()

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codePreviewCode || wizardData.code || '')
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
    toast({ title: 'Copied!', description: 'Code copied to clipboard' })
  }

  const handleDownloadCode = () => {
    const code = codePreviewCode || wizardData.code || ''
    const ext = wizardData.language === 'typescript' ? 'ts' : 'py'
    const blob = new Blob([code], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(wizardData.name || 'agent').replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Code Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agent Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="# Write your agent code here...&#10;&#10;from langchain.chat_models import ChatOpenAI&#10;from langgraph.graph import StateGraph&#10;&#10;# Define your agent logic..."
                className="font-mono text-sm min-h-[300px] bg-gray-950 text-gray-100 border-gray-800 relative"
                value={wizardData.code || ''}
                onChange={(e) => setWizardData({ code: e.target.value })}
              />
              {/* Gradient overlay for "scroll for more" hint */}
              <div className="h-8 bg-gradient-to-t from-gray-950 to-transparent -mt-8 relative pointer-events-none" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompt Template (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Define the system prompt or template your agent uses..."
                className="min-h-[120px]"
                value={wizardData.promptTemplate || ''}
                onChange={(e) => setWizardData({ promptTemplate: e.target.value })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">README (Markdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`# ${wizardData.name || 'My Agent'}\n\n## Description\n${wizardData.description || ''}\n\n## Usage\nInstructions on how to use this agent...`}
                className="min-h-[150px] font-mono text-sm"
                value={wizardData.readme || ''}
                onChange={(e) => setWizardData({ readme: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Code Preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Live Preview
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCopyCode}
                  >
                    {codeCopied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {codeCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleDownloadCode}
                  >
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <ScrollArea className="h-[600px]">
                  <pre className="p-4 text-xs font-mono bg-gray-950 text-gray-100 overflow-x-auto">
                    <code>{codePreviewCode || wizardData.code || '// Your code will appear here as you configure your agent...'}</code>
                  </pre>
                </ScrollArea>
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
