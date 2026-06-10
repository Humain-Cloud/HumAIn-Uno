'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompareArrows, Trash2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useMemo } from 'react'

interface CompareAgentInfo {
  id: string
  name: string
  framework: string | null
}

const frameworkColors: Record<string, string> = {
  langgraph: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  crewai: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  autogen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  agno: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  llamaindex: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

export function CompareBar() {
  const { compareAgentIds, removeCompareAgent, clearCompareAgents, setShowCompareModal } = useAppStore()
  const [fetchedInfos, setFetchedInfos] = useState<CompareAgentInfo[]>([])

  // Derive agentInfos: if no agents selected, show empty; otherwise use fetched data
  const agentInfos = useMemo(() => {
    if (compareAgentIds.length === 0) return []
    return fetchedInfos
  }, [compareAgentIds.length, fetchedInfos])

  useEffect(() => {
    if (compareAgentIds.length === 0) return

    let cancelled = false
    const fetchInfos = async () => {
      try {
        const res = await fetch('/api/knowledge/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: compareAgentIds }),
        })
        if (res.ok && !cancelled) {
          const data = await res.json()
          setFetchedInfos(data.data || [])
        }
      } catch {
        // Silently fail
      }
    }
    fetchInfos()
    return () => { cancelled = true }
  }, [compareAgentIds])

  if (compareAgentIds.length === 0) return null

  return (
    <AnimatePresence>
      {compareAgentIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-emerald-500/10 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              {/* Badge */}
              <div className="shrink-0">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold px-2.5 py-1">
                  {compareAgentIds.length} selected
                </Badge>
              </div>

              {/* Agent mini cards */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0 scrollbar-none">
                {agentInfos.map((agent) => {
                  const fwColor = frameworkColors[(agent.framework || '').toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-2.5 py-1.5 shrink-0"
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {agent.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate max-w-[100px]">{agent.name}</p>
                        {agent.framework && (
                          <Badge variant="secondary" className={`text-[9px] px-1 py-0 h-4 ${fwColor}`}>
                            {agent.framework}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCompareAgent(agent.id) }}
                        className="h-4 w-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive h-8"
                  onClick={clearCompareAgents}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 h-8"
                  disabled={compareAgentIds.length < 2}
                  onClick={() => setShowCompareModal(true)}
                >
                  <GitCompareArrows className="h-3.5 w-3.5 mr-1.5" />
                  Compare
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
