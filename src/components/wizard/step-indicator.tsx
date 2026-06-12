'use client'

import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { STEPS, frameworkColors } from './shared-data'

interface StepIndicatorProps {
  wizardStep: number
  wizardData: Record<string, any>
  getStepErrorCount: (step: number) => number
}

export function StepIndicator({ wizardStep, wizardData, getStepErrorCount }: StepIndicatorProps) {
  const getStepColor = (stepIndex: number) => {
    const fw = wizardData.framework?.toLowerCase()
    if (stepIndex === wizardStep && fw && frameworkColors[fw]) {
      return frameworkColors[fw]
    }
    return null
  }

  return (
    <div className="flex items-center justify-between mb-8 relative">
      {/* Gradient connecting line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 mx-10 sm:mx-12 z-0">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(wizardStep / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {STEPS.map((step, i) => {
        const stepColor = getStepColor(i)
        const errorCount = getStepErrorCount(i)
        const isCompleted = i < wizardStep
        const isCurrent = i === wizardStep

        return (
          <div key={i} className="flex flex-col items-center relative z-10">
            <div className="relative">
              <div
                className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all will-change-transform ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? stepColor
                      ? `${stepColor.bg} ${stepColor.active} ring-2 ${stepColor.ring}`
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-600 dark:ring-emerald-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {/* Error count badge */}
              {errorCount > 0 && !isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold"
                >
                  {errorCount}
                </motion.div>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs mt-1 text-center ${
              isCurrent
                ? stepColor
                  ? stepColor.active + ' font-medium'
                  : 'text-emerald-700 dark:text-emerald-300 font-medium'
                : isCompleted
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        )
      })}
    </div>
  )
}
