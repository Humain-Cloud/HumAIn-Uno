'use client'

import { motion } from 'framer-motion'
import { getFrameworkGradient } from './shared-data'

interface FrameworkColorStripProps {
  framework: string | null | undefined
}

export function FrameworkColorStrip({ framework }: FrameworkColorStripProps) {
  const fwGradient = getFrameworkGradient(framework)

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`h-2 rounded-full bg-gradient-to-r ${fwGradient.from} ${fwGradient.to} mb-6 origin-left shimmer will-change-transform`}
    />
  )
}
