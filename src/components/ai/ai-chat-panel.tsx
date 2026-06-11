'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, User, RotateCcw } from 'lucide-react'
import { useAppStore, ChatMessage } from '@/lib/store'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const QUICK_ACTIONS = [
  'Best RAG agent?',
  'Compare LangGraph vs CrewAI',
  'Suggest a coding agent',
]

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your AI assistant for Humain-Uno. I can help you find the perfect AI agent, explain frameworks, or suggest the best approach for your use case. What are you looking for?",
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-emerald-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentSuggestionCard({
  agent,
  onSelect,
}: {
  agent: { id: string; name: string; framework: string | null; description: string }
  onSelect: (id: string) => void
}) {
  const frameworkColors: Record<string, string> = {
    langgraph: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
    crewai: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    autogen: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
    agno: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400',
    llamaindex: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400',
  }
  const colorClass = frameworkColors[(agent.framework || '').toLowerCase()] || 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 group"
      onClick={() => onSelect(agent.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {agent.name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {agent.description}
          </p>
        </div>
        {agent.framework && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${colorClass}`}>
            {agent.framework}
          </Badge>
        )}
      </div>
    </motion.button>
  )
}

function MessageBubble({
  message,
  onAgentSelect,
}: {
  message: ChatMessage
  onAgentSelect: (id: string) => void
}) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gray-200 dark:bg-gray-700'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
          }`}
        >
          {/* Simple markdown-like rendering for AI messages */}
          {!isUser ? (
            <div className="whitespace-pre-wrap">
              {message.content.split('\n').map((line, i) => {
                // Bold
                const parts = line.split(/(\*\*[^*]+\*\*)/g)
                return (
                  <span key={i}>
                    {i > 0 && <br />}
                    {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>
                      }
                      return <span key={j}>{part}</span>
                    })}
                  </span>
                )
              })}
            </div>
          ) : (
            message.content
          )}
        </div>

        {/* Suggested agents */}
        {message.suggestedAgents && message.suggestedAgents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Suggested agents:
            </p>
            {message.suggestedAgents.map((agent) => (
              <AgentSuggestionCard
                key={agent.id}
                agent={agent}
                onSelect={onAgentSelect}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function AiChatPanel() {
  const { chatOpen, setChatOpen, chatMessages, addChatMessage, clearChatMessages } = useAppStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // All messages including welcome
  const allMessages = chatMessages.length === 0 ? [WELCOME_MESSAGE] : chatMessages

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isLoading])

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [chatOpen])

  const handleAgentSelect = useCallback(
    (id: string) => {
      const store = useAppStore.getState()
      store.setSelectedAgentId(id)
      store.setCurrentView('detail')
      setChatOpen(false)
      window.scrollTo(0, 0)
    },
    [setChatOpen]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = { role: 'user', content: content.trim() }
      addChatMessage(userMessage)
      setInput('')
      setIsLoading(true)

      try {
        // Build messages array for API (include history)
        const messagesForApi = [...chatMessages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await api.ai.chat(messagesForApi) as {
          message: string
          suggestedAgents?: Array<{
            id: string
            name: string
            framework: string | null
            description: string
          }>
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          suggestedAgents: response.suggestedAgents,
        }
        addChatMessage(assistantMessage)
      } catch {
        addChatMessage({
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or browse our Knowledge Hub to explore agents manually!",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [chatMessages, addChatMessage, isLoading]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AnimatePresence>
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-40 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-12rem)] rounded-2xl overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AI Assistant
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Ask me about AI agents &amp; frameworks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={clearChatMessages}
                  title="Clear chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setChatOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(16, 185, 129, 0.3) transparent',
            }}
          >
            {allMessages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                onAgentSelect={handleAgentSelect}
              />
            ))}
            {isLoading && <TypingIndicator />}
          </div>

          {/* Quick actions */}
          {chatMessages.length <= 1 && !isLoading && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 dark:border-gray-800">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80"
          >
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about AI agents..."
                disabled={isLoading}
                className="flex-1 h-10 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 disabled:opacity-50 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
