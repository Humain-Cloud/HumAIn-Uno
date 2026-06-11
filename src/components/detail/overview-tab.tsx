'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag, User, ExternalLink } from 'lucide-react'
import type { KnowledgeAgent } from '@/lib/types'
import { AgentMetadataSidebar } from './agent-metadata-sidebar'

interface OverviewTabProps {
  agent: KnowledgeAgent
  ratings: Record<string, number>
  onSetRating: (agentId: string, rating: number) => void
}

export function OverviewTab({ agent, ratings, onSetRating }: OverviewTabProps) {
  return (
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
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <User className="h-3 w-3" />
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
                <ExternalLink className="h-3 w-3" /> View Source Repository
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

      {/* Sidebar - Enhanced Metadata */}
      <AgentMetadataSidebar
        agent={agent}
        ratings={ratings}
        onSetRating={onSetRating}
      />
    </div>
  )
}
