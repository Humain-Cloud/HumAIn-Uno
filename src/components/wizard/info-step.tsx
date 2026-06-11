'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import type { Category } from '@/lib/types'

interface InfoStepProps {
  wizardData: Record<string, any>
  setWizardData: (data: Record<string, any>) => void
  categories: Category[]
  validationErrors: Record<string, string>
  tagInput: string
  setTagInput: (input: string) => void
  handleAddTag: () => void
  handleRemoveTag: (tag: string) => void
  descriptionGenerating: boolean
  handleAIDescription: () => void
}

export function InfoStep({
  wizardData,
  setWizardData,
  categories,
  validationErrors,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  descriptionGenerating,
  handleAIDescription,
}: InfoStepProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="agent-name" className="flex items-center gap-1">
              Agent Name *
              {validationErrors.name && (
                <span className="text-rose-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {validationErrors.name}
                </span>
              )}
            </Label>
            <Input
              id="agent-name"
              placeholder="My Awesome Agent"
              value={wizardData.name || ''}
              onChange={(e) => setWizardData({ name: e.target.value })}
              className={validationErrors.name ? 'border-rose-300 focus-visible:ring-rose-300' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Category *
              {validationErrors.category && (
                <span className="text-rose-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {validationErrors.category}
                </span>
              )}
            </Label>
            <Select
              value={wizardData.category || ''}
              onValueChange={(v) => setWizardData({ category: v })}
            >
              <SelectTrigger className={validationErrors.category ? 'border-rose-300' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select
              value={wizardData.framework || ''}
              onValueChange={(v) => setWizardData({ framework: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="langgraph">LangGraph</SelectItem>
                <SelectItem value="crewai">CrewAI</SelectItem>
                <SelectItem value="autogen">AutoGen</SelectItem>
                <SelectItem value="agno">Agno</SelectItem>
                <SelectItem value="llamaindex">LlamaIndex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="agent-desc" className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                Description *
                {validationErrors.description && (
                  <span className="text-rose-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.description}
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                onClick={handleAIDescription}
                disabled={descriptionGenerating || !wizardData.name?.trim()}
              >
                {descriptionGenerating ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" /> Generate with AI</>
                )}
              </Button>
            </Label>
            <Textarea
              id="agent-desc"
              placeholder="Describe what your agent does..."
              value={wizardData.description || ''}
              onChange={(e) => setWizardData({ description: e.target.value })}
              className={`min-h-[80px] ${validationErrors.description ? 'border-rose-300 focus-visible:ring-rose-300' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select
              value={wizardData.industry || ''}
              onValueChange={(v) => setWizardData({ industry: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="ecommerce">E-Commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={wizardData.difficulty || ''}
              onValueChange={(v) => setWizardData({ difficulty: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Input
              placeholder="e.g., gpt-4o, claude-3.5"
              value={wizardData.llm || ''}
              onChange={(e) => setWizardData({ llm: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={wizardData.language || 'python'}
              onValueChange={(v) => setWizardData({ language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {wizardData.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {wizardData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
