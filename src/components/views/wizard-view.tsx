'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { useRequireAuth } from '@/components/auth/auth-modal'
import type { KnowledgeAgent, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { STEPS, TEMPLATES, generateScaffoldedCode } from '@/components/wizard/shared-data'
import { StepIndicator } from '@/components/wizard/step-indicator'
import { SourceStep } from '@/components/wizard/source-step'
import { InfoStep } from '@/components/wizard/info-step'
import { CodeStep } from '@/components/wizard/code-step'
import { ConfigStep } from '@/components/wizard/config-step'
import { ReviewStep } from '@/components/wizard/review-step'

export function WizardView() {
  const { wizardStep, setWizardStep, wizardData, setWizardData, setCurrentView, setSelectedAgentId } = useAppStore()
  const { requireAuth } = useRequireAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeAgent[]>([])
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [descriptionGenerating, setDescriptionGenerating] = useState(false)
  const [codePreviewCode, setCodePreviewCode] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [startingPoint, setStartingPoint] = useState<'scratch' | 'fork' | 'template' | 'knowledge_base'>(
    wizardData.source === 'fork' ? 'fork' : wizardData.source === 'template' ? 'template' : wizardData.source === 'knowledge_base' ? 'knowledge_base' : 'scratch'
  )
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Search knowledge base for remix
  useEffect(() => {
    if (wizardStep !== 1 || !knowledgeSearch.trim()) {
      if (wizardStep === 1 && !knowledgeSearch.trim()) {
        api.knowledge.list({ page: 1, pageSize: 12 }).then((data: any) => {
          setKnowledgeResults(data?.data || data || [])
        }).catch(console.error)
      }
      return
    }

    const timer = setTimeout(async () => {
      setKnowledgeLoading(true)
      try {
        const data: any = await api.knowledge.search({ q: knowledgeSearch, pageSize: 12 })
        setKnowledgeResults(data?.data || data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setKnowledgeLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [knowledgeSearch, wizardStep])

  // Generate live code preview
  useEffect(() => {
    if (wizardStep === 3) {
      const scaffold = generateScaffoldedCode(wizardData)
      setCodePreviewCode(scaffold)
    }
  }, [wizardStep, wizardData.framework, wizardData.name, wizardData.language, wizardData.llm, wizardData.description, wizardData.suggestedTools, wizardData.tags])

  // Validate current step
  const validateStep = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {}
    switch (step) {
      case 2:
        if (!wizardData.name?.trim()) {
          errors.name = 'Agent name is required'
        } else if (wizardData.name.trim().length < 3) {
          errors.name = 'Agent name must be at least 3 characters'
        }
        if (!wizardData.description?.trim()) {
          errors.description = 'Description is required'
        } else if (wizardData.description.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters'
        }
        if (!wizardData.category) {
          errors.category = 'At least one category must be selected'
        }
        break
    }
    return errors
  }

  // Update validation errors when step changes
  useEffect(() => {
    const errors = validateStep(wizardStep)
    setValidationErrors(errors)
  }, [wizardStep, wizardData.name, wizardData.description, wizardData.category])

  const handleAISuggest = async () => {
    if (!wizardData.problem?.trim()) return
    setAiLoading(true)
    try {
      const suggestion: any = await api.ai.suggest(wizardData.problem)
      setAiSuggestions([suggestion])
      if (suggestion.name) setWizardData({ suggestedName: suggestion.name })
      if (suggestion.framework) setWizardData({ framework: suggestion.framework })
      if (suggestion.category) setWizardData({ suggestedCategory: suggestion.category })
      if (suggestion.tools) setWizardData({ suggestedTools: suggestion.tools })
    } catch (err) {
      console.error('AI suggestion failed:', err)
      toast({ title: 'AI suggestion failed', description: 'Please try again or fill in manually', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIDescription = async () => {
    if (!wizardData.name?.trim()) {
      toast({ title: 'Name required', description: 'Please enter an agent name first', variant: 'destructive' })
      return
    }
    setDescriptionGenerating(true)
    try {
      const suggestion: any = await api.ai.suggest(`Generate a description for an AI agent named "${wizardData.name}" in the ${wizardData.framework || 'AI'} framework, category: ${wizardData.category || 'general'}`)
      if (suggestion.description) {
        setWizardData({ description: suggestion.description })
      } else if (suggestion.suggestion?.description) {
        setWizardData({ description: suggestion.suggestion.description })
      }
    } catch (err) {
      console.error('AI description failed:', err)
      toast({ title: 'AI generation failed', description: 'Using a template description instead', variant: 'destructive' })
      setWizardData({
        description: `${wizardData.name} is an AI-powered agent built with ${wizardData.framework || 'an AI framework'} that helps automate tasks and improve productivity. It leverages advanced language models to provide intelligent, context-aware responses and actions.`
      })
    } finally {
      setDescriptionGenerating(false)
    }
  }

  const handleRemixAgent = (agent: KnowledgeAgent) => {
    setWizardData({
      name: `${agent.name} (Remix)`,
      description: agent.description,
      code: agent.codeSnippet || '',
      readme: agent.readme || '',
      framework: agent.framework || '',
      category: agent.category,
      source: 'fork',
      parentId: agent.id,
      difficulty: agent.difficulty || '',
      industry: agent.industry || '',
      language: agent.language || 'python',
    })
    setWizardStep(2)
  }

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setWizardData({
      name: template.name,
      description: template.description,
      framework: template.framework,
      category: template.category,
      difficulty: template.difficulty,
      industry: template.industry,
      llm: template.llm,
      language: template.language,
      tags: template.tags,
      suggestedTools: template.tools,
      code: template.codeScaffold,
      source: 'template',
    })
    setStartingPoint('template')
    setWizardStep(2)
    toast({ title: 'Template applied!', description: `${template.name} template has been loaded into the wizard.` })
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const tags = [...(wizardData.tags || []), tagInput.trim()]
    setWizardData({ tags })
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setWizardData({ tags: (wizardData.tags || []).filter((t: string) => t !== tag) })
  }

  const handlePublish = async () => {
    if (!requireAuth()) return

    setPublishing(true)
    try {
      const cat = categories.find(c => c.name === wizardData.category || c.id === wizardData.category)
      const result: any = await api.agents.create({
        name: wizardData.name,
        description: wizardData.description,
        categoryId: cat?.id || wizardData.category || categories[0]?.id,
        privacy: wizardData.privacy || 'PUBLIC',
        source: wizardData.source || 'scratch',
        parentId: wizardData.parentId,
        readme: wizardData.readme || `# ${wizardData.name}\n\n${wizardData.description || ''}`,
        code: wizardData.code,
        tags: wizardData.tags || [],
        framework: wizardData.framework,
        llm: wizardData.llm,
        industry: wizardData.industry,
        difficulty: wizardData.difficulty,
        language: wizardData.language || 'python',
      })

      toast({ title: 'Agent published!', description: `${wizardData.name} is now live` })

      if (result?.id) {
        setSelectedAgentId(result.id)
        setCurrentView('detail')
      } else {
        setCurrentView('dashboard')
        setSelectedAgentId(null)
      }
    } catch (err: any) {
      toast({ title: 'Publish failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  const canGoNext = () => {
    const errors = validateStep(wizardStep)
    switch (wizardStep) {
      case 0: return true
      case 1: return true
      case 2: return Object.keys(errors).length === 0 && !!(wizardData.name && wizardData.category)
      case 3: return true
      case 4: return !!(wizardData.name && wizardData.description)
      default: return true
    }
  }

  const progress = ((wizardStep + 1) / STEPS.length) * 100

  const getStepErrorCount = (step: number): number => {
    return Object.keys(validateStep(step)).length
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => {
          setCurrentView('home')
          setSelectedAgentId(null)
        }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create Agent</h1>
            <p className="text-sm text-muted-foreground mt-1">{STEPS[wizardStep].description}</p>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            {Math.round(progress)}% complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      {/* Step Indicators */}
      <StepIndicator
        wizardStep={wizardStep}
        wizardData={wizardData}
        getStepErrorCount={getStepErrorCount}
      />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Step 0: Problem & Step 1: Starting Point */}
          {(wizardStep === 0 || wizardStep === 1) && (
            <SourceStep
              wizardStep={wizardStep}
              wizardData={wizardData}
              setWizardData={setWizardData}
              setWizardStep={setWizardStep}
              startingPoint={startingPoint}
              setStartingPoint={setStartingPoint}
              aiLoading={aiLoading}
              aiSuggestions={aiSuggestions}
              handleAISuggest={handleAISuggest}
              handleUseTemplate={handleUseTemplate}
              handleRemixAgent={handleRemixAgent}
              knowledgeSearch={knowledgeSearch}
              setKnowledgeSearch={setKnowledgeSearch}
              knowledgeResults={knowledgeResults}
              knowledgeLoading={knowledgeLoading}
            />
          )}

          {/* Step 2: Specifications */}
          {wizardStep === 2 && (
            <InfoStep
              wizardData={wizardData}
              setWizardData={setWizardData}
              categories={categories}
              validationErrors={validationErrors}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              descriptionGenerating={descriptionGenerating}
              handleAIDescription={handleAIDescription}
            />
          )}

          {/* Step 3: Code */}
          {wizardStep === 3 && (
            <CodeStep
              wizardData={wizardData}
              setWizardData={setWizardData}
              codePreviewCode={codePreviewCode}
              codeCopied={codeCopied}
              setCodeCopied={setCodeCopied}
            />
          )}

          {/* Step 4: Config + Review & Publish */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <ReviewStep
                wizardData={wizardData}
                publishing={publishing}
                handlePublish={handlePublish}
              />
              <ConfigStep
                wizardData={wizardData}
                setWizardData={setWizardData}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
          disabled={wizardStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {wizardStep < STEPS.length - 1 && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setWizardStep(wizardStep + 1)}
            disabled={!canGoNext()}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
