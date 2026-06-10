'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import type { KnowledgeAgent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AgentCard } from '@/components/agents/agent-card'
import { useRequireAuth } from '@/components/auth/auth-modal'
import {
  ArrowLeft,
  Star,
  GitFork,
  Copy,
  BookOpen,
  Code2,
  FileText,
  ExternalLink,
  Send,
  Check,
  Loader2,
  ThumbsUp,
  Tag,
  Wrench,
  Cpu,
  Building2,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function DetailView() {
  const { selectedAgentId, setCurrentView, setSelectedAgentId } = useAppStore()
  const { session, status, requireAuth, isAuthenticated } = useRequireAuth()
  const [agent, setAgent] = useState<KnowledgeAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [starred, setStarred] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [similarAgents, setSimilarAgents] = useState<KnowledgeAgent[]>([])

  useEffect(() => {
    if (!selectedAgentId) return

    async function loadAgent() {
      setLoading(true)
      try {
        const data: any = await api.knowledge.get(selectedAgentId!)
        const parsed = {
          ...data,
          tools: typeof data.tools === 'string' ? JSON.parse(data.tools || '[]') : data.tools || [],
          models: typeof data.models === 'string' ? JSON.parse(data.models || '[]') : data.models || [],
          tags: typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : data.tags || [],
        }
        setAgent(parsed)

        // Load similar agents from same category/framework
        if (parsed.category || parsed.framework) {
          try {
            const similar: any = await api.knowledge.search({
              category: parsed.category,
              pageSize: 4,
            })
            const similarList = (similar?.data || similar || [])
              .filter((a: any) => a.id !== selectedAgentId)
              .slice(0, 3)
            setSimilarAgents(similarList)
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load agent:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [selectedAgentId])

  const handleCopy = async () => {
    if (!agent?.codeSnippet) return
    await navigator.clipboard.writeText(agent.codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStar = () => {
    if (!requireAuth()) return
    setStarred(!starred)
  }

  const handleFork = () => {
    if (!requireAuth(() => {
      // After auth, go to wizard with prefill
      const store = useAppStore.getState()
      store.setWizardData({
        name: `${agent?.name} (Remix)`,
        description: agent?.description,
        code: agent?.codeSnippet || '',
        readme: agent?.readme || '',
        framework: agent?.framework,
        category: agent?.category,
        source: 'fork',
        parentId: agent?.id,
      })
      store.setWizardStep(2)
      store.setCurrentView('wizard')
    })) return

    // Already authenticated
    const store = useAppStore.getState()
    store.setWizardData({
      name: `${agent?.name} (Remix)`,
      description: agent?.description,
      code: agent?.codeSnippet || '',
      readme: agent?.readme || '',
      framework: agent?.framework,
      category: agent?.category,
      source: 'fork',
      parentId: agent?.id,
    })
    store.setWizardStep(2)
    store.setCurrentView('wizard')
  }

  const handleComment = async () => {
    if (!commentText.trim() || !selectedAgentId) return
    if (!requireAuth()) return
    setSubmittingComment(true)
    try {
      const result = await api.agents.comment(selectedAgentId, commentText)
      setComments(prev => [...prev, result])
      setCommentText('')
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const goBack = () => {
    setCurrentView('browse')
    setSelectedAgentId(null)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Skeleton className="h-6 w-20 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
        <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
        <Button onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
        </Button>
      </div>
    )
  }

  const fwColors: Record<string, string> = {
    langgraph: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    crewai: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    autogen: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    agno: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    llamaindex: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={goBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
              {agent.isCurated && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <BookOpen className="h-3 w-3 mr-1" /> Knowledge Base
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {agent.framework && (
                <Badge variant="secondary" className={fwColors[agent.framework.toLowerCase()] || ''}>
                  {agent.framework}
                </Badge>
              )}
              <Badge variant="outline">{agent.category}</Badge>
              {agent.difficulty && (
                <Badge variant="outline" className="capitalize">
                  <BarChart3 className="h-3 w-3 mr-1" /> {agent.difficulty}
                </Badge>
              )}
              {agent.language && (
                <Badge variant="outline">{agent.language}</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">{agent.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStar}
              className={starred ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}
            >
              <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500 text-amber-500' : ''}`} />
              {starred ? 'Starred' : 'Star'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleFork}>
              <GitFork className="h-4 w-4 mr-1" /> Remix
            </Button>
            {agent.codeSnippet && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <><Check className="h-4 w-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copy</>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-1" /> Overview
          </TabsTrigger>
          {agent.codeSnippet && (
            <TabsTrigger value="code">
              <Code2 className="h-4 w-4 mr-1" /> Code
            </TabsTrigger>
          )}
          <TabsTrigger value="readme">
            <BookOpen className="h-4 w-4 mr-1" /> README
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About this agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  {agent.author && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Created by <span className="font-medium">{agent.author}</span>
                    </p>
                  )}
                  {agent.sourceUrl && (
                    <a
                      href={agent.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-2"
                    >
                      <ExternalLink className="h-3 w-3" /> View Source
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {agent.tools && agent.tools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" /> Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {agent.models && agent.models.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.models.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agent.framework && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Framework</span>
                      <span className="font-medium">{agent.framework}</span>
                    </div>
                  )}
                  {agent.industry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium capitalize">{agent.industry}</span>
                    </div>
                  )}
                  {agent.difficulty && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className="font-medium capitalize">{agent.difficulty}</span>
                    </div>
                  )}
                  {agent.language && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">{agent.language}</span>
                    </div>
                  )}
                  {agent.llm && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LLM</span>
                      <span className="font-medium">{agent.llm}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Code Tab */}
        {agent.codeSnippet && (
          <TabsContent value="code">
            <Card>
              <CardContent className="p-0 relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs"
                  >
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <SyntaxHighlighter
                  language={agent.language?.toLowerCase() === 'typescript' ? 'typescript' : 'python'}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    maxHeight: '600px',
                  }}
                  showLineNumbers
                >
                  {agent.codeSnippet}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* README Tab */}
        <TabsContent value="readme">
          <Card>
            <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {agent.readme || 'No README available for this agent.'}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Comments Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <Card className="mb-4">
          <CardContent className="p-4">
            <Textarea
              placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isAuthenticated}
              className="mb-3 min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!commentText.trim() || !isAuthenticated || submittingComment}
                onClick={handleComment}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
                      {(comment.user?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>

      {/* Similar Agents */}
      {similarAgents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Similar Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarAgents.map((a, i) => (
              <AgentCard key={a.id} agent={a} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
