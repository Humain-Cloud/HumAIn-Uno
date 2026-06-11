'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'

export function AiChatButton() {
  const { chatOpen, setChatOpen } = useAppStore()

  return (
    <motion.button
      onClick={() => setChatOpen(!chatOpen)}
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      whileTap={{ scale: 0.9 }}
      aria-label={chatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {!chatOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      <Sparkles className="h-6 w-6 relative z-10 group-hover:rotate-12 transition-transform duration-200" />
      {!chatOpen && (
        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 shadow-sm">
          AI
        </Badge>
      )}
    </motion.button>
  )
}
