'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  LayoutTemplate,
  Search,
  Loader2,
  Check,
  ArrowRight,
  X,
  Star,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface TemplateGalleryProps {
  onCreated: () => void
}

interface KnowledgeAgent {
  id: string
  name: string
  category: string
  description: string
  tools: string[]
  models: string[]
  framework: string | null
  llm: string | null
  industry: string | null
  difficulty: string | null
  language: string | null
  tags: string[]
  isCurated: boolean
}

const FRAMEWORK_FILTERS = [
  { id: 'all', label: 'All Frameworks' },
  { id: 'langgraph', label: 'LangGraph' },
  { id: 'crewai', label: 'CrewAI' },
  { id: 'autogen', label: 'AutoGen' },
  { id: 'agno', label: 'Agno' },
  { id: 'llamaindex', label: 'LlamaIndex' },
]

const frameworkBadge: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

export function TemplateGallery({ onCreated }: TemplateGalleryProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<KnowledgeAgent[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [frameworkFilter, setFrameworkFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<KnowledgeAgent | null>(null)
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Customize form state
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customPrivacy, setCustomPrivacy] = useState('PUBLIC')

  // Load templates from knowledge base
  useEffect(() => {
    async function loadTemplates() {
      setLoading(true)
      try {
        const data: any = await api.knowledge.list({ page: 1, pageSize: 50 })
        const agents = data?.data || data || []
        setTemplates(agents)
      } catch (err) {
        console.error('Failed to load templates:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [])

  // Load categories
  useEffect(() => {
    api.categories.list().then((data: any) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(console.error)
  }, [])

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFramework = frameworkFilter === 'all' ||
      t.framework?.toLowerCase() === frameworkFilter.toLowerCase()
    return matchesSearch && matchesFramework
  })

  const handleSelectTemplate = (template: KnowledgeAgent) => {
    setSelectedTemplate(template)
    setCustomName(template.name)
    setCustomDescription(template.description)
    setCustomizeDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!selectedTemplate) return
    setPublishing(true)
    try {
      const cat = categories.find(c =>
        c.name.toLowerCase() === selectedTemplate.category?.toLowerCase()
      )

      await api.agents.create({
        name: customName || selectedTemplate.name,
        description: customDescription || selectedTemplate.description,
        categoryId: cat?.id || categories[0]?.id,
        privacy: customPrivacy,
        source: 'template',
        readme: `# ${customName || selectedTemplate.name}\n\n${customDescription || selectedTemplate.description}\n\n## Template Info\n\n- **Original**: ${selectedTemplate.name}\n- **Framework**: ${selectedTemplate.framework || 'N/A'}\n- **Category**: ${selectedTemplate.category}\n- **Tools**: ${selectedTemplate.tools?.join(', ') || 'None'}\n- **Models**: ${selectedTemplate.models?.join(', ') || 'Not specified'}\n\n## Tags\n\n${selectedTemplate.tags?.map(t => `\`${t}\``).join(', ') || 'None'}\n`,
        code: selectedTemplate.framework || null,
        tags: selectedTemplate.tags || [],
        framework: selectedTemplate.framework,
        llm: selectedTemplate.llm,
        industry: selectedTemplate.industry,
        difficulty: selectedTemplate.difficulty,
        language: selectedTemplate.language || 'python',
      })

      toast({ title: 'Agent created!', description: `${customName} has been created from template.` })
      setCustomizeDialogOpen(false)
      onCreated()
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err.message || 'Please try again', variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <LayoutTemplate className="h-6 w-6 text-amber-600" />
          From Template
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose from curated agent templates. Customize and deploy in minutes.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FRAMEWORK_FILTERS.map(fw => (
            <Button
              key={fw.id}
              variant={frameworkFilter === fw.id ? 'default' : 'outline'}
              size="sm"
              className={`whitespace-nowrap ${frameworkFilter === fw.id ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              onClick={() => setFrameworkFilter(fw.id)}
            >
              {fw.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No templates found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 h-full rounded-xl group"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {template.name}
                    </h3>
                    {template.isCurated && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shrink-0">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> Curated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {template.framework && (
                      <Badge className={`text-[10px] px-2 py-0.5 ${frameworkBadge[template.framework.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                        {template.framework}
                      </Badge>
                    )}
                    {template.category && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {template.category}
                      </Badge>
                    )}
                    {template.difficulty && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">
                        {template.difficulty}
                      </Badge>
                    )}
                  </div>
                  {template.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{template.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customize Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Customize Template
            </DialogTitle>
            <DialogDescription>
              Customize your agent before creating it from the &quot;{selectedTemplate?.name}&quot; template.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              {/* Template Info */}
              <div className="flex gap-2 flex-wrap">
                {selectedTemplate.framework && (
                  <Badge className={`text-xs ${frameworkBadge[selectedTemplate.framework.toLowerCase()] || ''}`}>
                    {selectedTemplate.framework}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{selectedTemplate.category}</Badge>
                {selectedTemplate.difficulty && (
                  <Badge variant="secondary" className="text-xs capitalize">{selectedTemplate.difficulty}</Badge>
                )}
              </div>

              {/* Customize Form */}
              <div className="space-y-2">
                <Label htmlFor="custom-name">Agent Name</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-desc">Description</Label>
                <Textarea
                  id="custom-desc"
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Describe your agent..."
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={customPrivacy} onValueChange={setCustomPrivacy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public — Everyone can discover</SelectItem>
                    <SelectItem value="PRIVATE">Private — Only you can see</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted — Link only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate.tools?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Included Tools:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.tools.map(tool => (
                      <Badge key={tool} variant="secondary" className="text-xs">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCustomizeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  onClick={handleCreate}
                  disabled={publishing || !customName.trim()}
                >
                  {publishing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" /> Create from Template</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
