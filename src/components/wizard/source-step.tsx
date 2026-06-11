'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  Search,
  Loader2,
  PlusCircle,
  Bot,
  ArrowRight,
  Lightbulb,
  LayoutTemplate,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AgentCard } from '@/components/agents/agent-card'
import type { KnowledgeAgent } from '@/lib/types'
import { TEMPLATES, templateIcons, templateFrameworkBadge, difficultyBadge } from './shared-data'

interface SourceStepProps {
  wizardStep: number
  wizardData: Record<string, any>
  setWizardData: (data: Record<string, any>) => void
  setWizardStep: (step: number) => void
  startingPoint: 'scratch' | 'fork' | 'template' | 'knowledge_base'
  setStartingPoint: (point: 'scratch' | 'fork' | 'template' | 'knowledge_base') => void
  aiLoading: boolean
  aiSuggestions: any[]
  handleAISuggest: () => void
  handleUseTemplate: (template: typeof TEMPLATES[0]) => void
  handleRemixAgent: (agent: KnowledgeAgent) => void
  knowledgeSearch: string
  setKnowledgeSearch: (search: string) => void
  knowledgeResults: KnowledgeAgent[]
  knowledgeLoading: boolean
}

export function SourceStep({
  wizardStep,
  wizardData,
  setWizardData,
  setWizardStep,
  startingPoint,
  setStartingPoint,
  aiLoading,
  aiSuggestions,
  handleAISuggest,
  handleUseTemplate,
  handleRemixAgent,
  knowledgeSearch,
  setKnowledgeSearch,
  knowledgeResults,
  knowledgeLoading,
}: SourceStepProps) {
  // Step 0: Problem
  if (wizardStep === 0) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              What problem does your agent solve?
            </h3>
            <p className="text-sm text-muted-foreground">
              Describe what you want your agent to do in natural language. Our AI will suggest the best approach.
            </p>
          </div>
          <Textarea
            placeholder="e.g., I need an agent that can analyze customer support tickets, categorize them by urgency, and draft response templates..."
            className="min-h-[120px]"
            value={wizardData.problem || ''}
            onChange={(e) => setWizardData({ problem: e.target.value })}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAISuggest}
            disabled={!wizardData.problem?.trim() || aiLoading}
          >
            {aiLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Getting AI suggestions...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2 text-amber-500" /> Get AI Suggestions</>
            )}
          </Button>

          {aiSuggestions.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-semibold">AI Suggestions</h4>
              {aiSuggestions.map((suggestion, i) => (
                <Card key={i} className="border-emerald-200 bg-emerald-50/50 gradient-border shimmer">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-sm">{suggestion.name || suggestion.suggestion?.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description || suggestion.suggestion?.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(suggestion.framework || suggestion.suggestion?.framework) && (
                        <Badge variant="secondary" className="text-[10px]">{suggestion.framework || suggestion.suggestion?.framework}</Badge>
                      )}
                      {(suggestion.category || suggestion.suggestion?.category) && (
                        <Badge variant="outline" className="text-[10px]">{suggestion.category || suggestion.suggestion?.category}</Badge>
                      )}
                      {(suggestion.tools || suggestion.suggestion?.tools || []).map((tool: string) => (
                        <Badge key={tool} variant="outline" className="text-[10px]">{tool}</Badge>
                      ))}
                    </div>
                    {(suggestion.codeScaffold || suggestion.suggestion?.codeScaffold) && (
                      <pre className="mt-3 p-2 bg-gray-900 text-gray-100 rounded text-[10px] overflow-x-auto max-h-32">
                        {(suggestion.codeScaffold || suggestion.suggestion?.codeScaffold).slice(0, 500)}
                      </pre>
                    )}
                    <Button
                      size="sm"
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        const s = suggestion.suggestion || suggestion
                        setWizardData({
                          name: s.name,
                          description: s.description,
                          framework: s.framework,
                          category: s.category,
                          suggestedTools: s.tools,
                          code: s.codeScaffold || '',
                          llm: s.llm,
                        })
                        setWizardStep(2)
                      }}
                    >
                      Use This Suggestion <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Step 1: Starting Point
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all duration-300 card-hover min-h-[44px] rounded-xl ${startingPoint === 'scratch' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => {
            setStartingPoint('scratch')
            setWizardData({ source: 'scratch', parentId: undefined })
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold mb-1">From Scratch</h3>
            <p className="text-xs text-muted-foreground">Start with a blank template</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all duration-300 card-hover min-h-[44px] rounded-xl ${startingPoint === 'fork' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => {
            setStartingPoint('fork')
            setWizardData({ source: 'fork' })
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold mb-1">From Knowledge Base</h3>
            <p className="text-xs text-muted-foreground">Start from an existing agent</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all duration-300 card-hover min-h-[44px] rounded-xl ${startingPoint === 'template' ? 'ring-2 ring-emerald-600 dark:ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => {
            setStartingPoint('template')
            setWizardData({ source: 'template' })
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="font-semibold mb-1">From Template</h3>
            <p className="text-xs text-muted-foreground">Use a pre-built template</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Library Grid */}
      {startingPoint === 'template' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-violet-500" />
            Choose a Template
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((template) => {
              const IconComponent = templateIcons[template.id] || Bot
              return (
                <Card key={template.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                        <IconComponent className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge className={`text-[10px] px-1.5 py-0 ${templateFrameworkBadge[template.framework] || ''}`}>
                            {template.framework}
                          </Badge>
                          <Badge className={`text-[10px] px-1.5 py-0 ${difficultyBadge[template.difficulty] || ''}`}>
                            {template.difficulty}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use Template <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Knowledge Base Remix */}
      {startingPoint === 'fork' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              className="pl-9"
              value={knowledgeSearch}
              onChange={(e) => setKnowledgeSearch(e.target.value)}
            />
          </div>
          {knowledgeLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {knowledgeResults.map((agent) => (
                <div key={agent.id} className="relative group">
                  <AgentCard agent={agent} viewMode="grid" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleRemixAgent(agent)}>
                      Use as Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
