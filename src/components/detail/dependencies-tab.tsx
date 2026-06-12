'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Wrench, Cpu, LayoutGrid } from 'lucide-react'
import type { KnowledgeAgent } from '@/lib/types'
import { getFrameworkGradient, nodeColors } from './shared-data'

interface DependenciesTabProps {
  agent: KnowledgeAgent
}

export function DependenciesTab({ agent }: DependenciesTabProps) {
  const fwGradient = getFrameworkGradient(agent.framework)

  const renderDependencyGraph = () => {
    const tools = agent.tools || []
    const models = agent.models || []
    const hasFramework = !!agent.framework

    // Calculate positions
    const allDeps = [
      ...tools.map((t: string) => ({ name: t, type: 'tool' })),
      ...models.map((m: string) => ({ name: m, type: 'model' })),
      ...(hasFramework ? [{ name: agent.framework!, type: 'framework' }] : []),
    ]

    if (allDeps.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No dependency information available for this agent.</p>
        </div>
      )
    }

    // Layout: center node, then orbit around it
    const centerX = 300
    const centerY = 200
    const radius = Math.min(150, 50 + allDeps.length * 20)

    const depPositions = allDeps.map((dep, i) => {
      const angle = (2 * Math.PI * i) / allDeps.length - Math.PI / 2
      return {
        ...dep,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })

    const nodeRadius = 30
    const centerNodeRadius = 40

    return (
      <svg viewBox="0 0 600 400" className="w-full h-auto" style={{ minHeight: '300px' }}>
        {/* Background grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />

        {/* Connection lines */}
        {depPositions.map((dep, i) => (
          <g key={`line-${i}`}>
            <line
              x1={centerX}
              y1={centerY}
              x2={dep.x}
              y2={dep.y}
              stroke={nodeColors[dep.type]}
              strokeWidth="2"
              strokeDasharray="6,3"
              opacity="0.4"
            />
            {/* Arrow at end */}
            <circle
              cx={dep.x - (dep.x - centerX) * (nodeRadius / Math.sqrt((dep.x - centerX) ** 2 + (dep.y - centerY) ** 2))}
              cy={dep.y - (dep.y - centerY) * (nodeRadius / Math.sqrt((dep.x - centerX) ** 2 + (dep.y - centerY) ** 2))}
              r="3"
              fill={nodeColors[dep.type]}
              opacity="0.6"
            />
          </g>
        ))}

        {/* Dependency nodes */}
        {depPositions.map((dep, i) => (
          <g key={`dep-${i}`} className="cursor-pointer">
            <circle
              cx={dep.x}
              cy={dep.y}
              r={nodeRadius}
              fill={nodeColors[dep.type]}
              opacity="0.15"
              stroke={nodeColors[dep.type]}
              strokeWidth="2"
            />
            <circle
              cx={dep.x}
              cy={dep.y}
              r={nodeRadius - 4}
              fill="var(--card, white)"
              opacity="0.95"
            />
            {/* Icon */}
            {dep.type === 'tool' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {dep.type === 'model' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
                <path d="M8 6v4M6 8h4" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {dep.type === 'framework' && (
              <g transform={`translate(${dep.x - 8}, ${dep.y - 14})`}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke={nodeColors[dep.type]} strokeWidth="1.5" />
              </g>
            )}
            {/* Name */}
            <text
              x={dep.x}
              y={dep.y + nodeRadius + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              fill="currentColor"
              className="text-foreground"
            >
              {dep.name.length > 14 ? dep.name.slice(0, 12) + '…' : dep.name}
            </text>
            <text
              x={dep.x}
              y={dep.y + nodeRadius + 24}
              textAnchor="middle"
              fontSize="7"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {dep.type}
            </text>
          </g>
        ))}

        {/* Center node - the agent */}
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius + 6}
            fill={nodeColors.agent}
            opacity="0.1"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius}
            fill={nodeColors.agent}
            opacity="0.2"
            stroke={nodeColors.agent}
            strokeWidth="3"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={centerNodeRadius - 4}
            fill="var(--card, white)"
            opacity="0.95"
          />
          {/* Agent icon */}
          <g transform={`translate(${centerX - 10}, ${centerY - 18})`}>
            <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z" fill="none" stroke={nodeColors.agent} strokeWidth="1.5" />
            <path d="M2 21v-1a7 7 0 0114 0v1" fill="none" stroke={nodeColors.agent} strokeWidth="1.5" />
          </g>
          <text
            x={centerX}
            y={centerY + centerNodeRadius + 16}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="currentColor"
            className="text-foreground"
          >
            {agent.name.length > 18 ? agent.name.slice(0, 16) + '…' : agent.name}
          </text>
          <text
            x={centerX}
            y={centerY + centerNodeRadius + 28}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            className="text-muted-foreground"
          >
            agent
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(10, 370)">
          <circle cx="10" cy="0" r="5" fill={nodeColors.agent} opacity="0.5" />
          <text x="20" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Agent</text>
          <circle cx="70" cy="0" r="5" fill={nodeColors.tool} opacity="0.5" />
          <text x="80" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Tool</text>
          <circle cx="120" cy="0" r="5" fill={nodeColors.model} opacity="0.5" />
          <text x="130" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Model</text>
          <circle cx="180" cy="0" r="5" fill={nodeColors.framework} opacity="0.5" />
          <text x="190" y="4" fontSize="9" fill="currentColor" className="text-muted-foreground">Framework</text>
        </g>
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" /> Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Visual representation of this agent&apos;s dependencies, tools, and models.
          </p>
          <div className="rounded-xl border bg-white dark:bg-gray-900/50 overflow-hidden">
            {renderDependencyGraph()}
          </div>
        </CardContent>
      </Card>

      {/* Dependency Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tools */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" /> Tools
              <Badge variant="secondary" className="text-[10px] ml-auto">{(agent.tools || []).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(agent.tools || []).length > 0 ? (
              <div className="space-y-2">
                {agent.tools.map((tool) => (
                  <div key={tool} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No tools required</p>
            )}
          </CardContent>
        </Card>

        {/* Models */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-500" /> Models
              <Badge variant="secondary" className="text-[10px] ml-auto">{(agent.models || []).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(agent.models || []).length > 0 ? (
              <div className="space-y-2">
                {agent.models.map((model) => (
                  <div key={model} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-violet-500" />
                    <span>{model}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No models specified</p>
            )}
          </CardContent>
        </Card>

        {/* Framework */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-cyan-500" /> Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agent.framework ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <Badge className={fwGradient.badge}>{agent.framework}</Badge>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No framework specified</p>
            )}
            {agent.llm && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">LLM Provider</p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{agent.llm}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
