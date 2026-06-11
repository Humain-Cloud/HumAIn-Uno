'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Star, Wrench, Cpu, Building2, BarChart3, Languages, User, Calendar, Database, Globe, BookOpen } from 'lucide-react'
import type { KnowledgeAgent } from '@/lib/types'
import { getFrameworkGradient, getDifficultyConfig } from './shared-data'

interface AgentMetadataSidebarProps {
  agent: KnowledgeAgent
  ratings: Record<string, number>
  onSetRating: (agentId: string, rating: number) => void
}

export function AgentMetadataSidebar({ agent, ratings, onSetRating }: AgentMetadataSidebarProps) {
  const fwGradient = getFrameworkGradient(agent.framework)
  const diffConfig = getDifficultyConfig(agent.difficulty)

  return (
    <div className="space-y-6">
      <Card className="border-l-2 border-l-emerald-500 dark:border-l-emerald-400">
        <CardHeader>
          <CardTitle className="text-base">Agent Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Framework */}
          {agent.framework && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className={`h-4 w-4 ${fwGradient.text}`} />
                <span className="text-muted-foreground">Framework</span>
              </div>
              <Badge className={fwGradient.badge}>{agent.framework}</Badge>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Your Rating</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onSetRating(agent.id, star)}
                  className="transition-all duration-150 hover:scale-125"
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      (ratings[agent.id] || 0) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              {ratings[agent.id] && (
                <span className="text-xs text-muted-foreground ml-1.5">
                  {ratings[agent.id]}/5
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              Community: {(((agent.id.charCodeAt(0) % 3) + 3) + ((agent.id.charCodeAt(1) % 10) / 10)).toFixed(1)}/5
              <span className="text-muted-foreground/60">(mock)</span>
            </div>
          </div>

          {/* Industry */}
          {agent.industry && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Industry</span>
              </div>
              <span className="text-sm font-medium capitalize">{agent.industry}</span>
            </div>
          )}

          {/* Difficulty with Progress Bar */}
          {agent.difficulty && diffConfig && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Difficulty</span>
                <span className={`ml-auto text-xs font-medium capitalize ${diffConfig.color}`}>
                  {agent.difficulty}
                </span>
              </div>
              <Progress
                value={diffConfig.value}
                className={`h-2 ${diffConfig.barClass}`}
              />
            </div>
          )}

          {/* Language */}
          {agent.language && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Language</span>
              </div>
              <span className="text-sm font-medium">{agent.language}</span>
            </div>
          )}

          {/* LLM Provider */}
          {agent.llm && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">LLM Provider</span>
              </div>
              <span className="text-sm font-medium">{agent.llm}</span>
            </div>
          )}

          {/* Source */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Source</span>
            </div>
            {agent.isCurated ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                <BookOpen className="h-3 w-3 mr-1" /> Knowledge Base
              </Badge>
            ) : (
              <span className="text-sm font-medium">Community</span>
            )}
          </div>

          {/* Author */}
          {agent.author && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Author</span>
              </div>
              <span className="text-sm font-medium">{agent.author}</span>
            </div>
          )}

          {/* Created Date */}
          {(agent as any).createdAt && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created</span>
              </div>
              <span className="text-sm font-medium">
                {new Date((agent as any).createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          <Separator />

          {/* Category */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category</span>
            </div>
            <Badge variant="outline">{agent.category}</Badge>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
