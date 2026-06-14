'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStepProps {
  stepNumber: number
  totalSteps: number
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  isNextDisabled?: boolean
  isNextLoading?: boolean
  isLastStep?: boolean
  showBack?: boolean
  direction?: number // 1 = forward, -1 = backward
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export function OnboardingStep({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  icon,
  children,
  onBack,
  onNext,
  onSkip,
  isNextDisabled = false,
  isNextLoading = false,
  isLastStep = false,
  showBack = true,
  direction = 1,
}: OnboardingStepProps) {
  const progress = (stepNumber / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {icon}
                </div>
              )}
              <span className="text-sm font-medium text-muted-foreground">
                Step {stepNumber} of {totalSteps}
              </span>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Skip this step
              </button>
            )}
          </div>
          {/* Progress track */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i + 1 === stepNumber
                    ? 'w-6 bg-emerald-500'
                    : i + 1 < stepNumber
                      ? 'w-1.5 bg-emerald-400'
                      : 'w-1.5 bg-muted-foreground/25'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepNumber}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-6"
            >
              {/* Header */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-lg">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Content slot */}
              <div className="flex-1">{children}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="sticky bottom-0 z-30 bg-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            {showBack && onBack ? (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isNextLoading}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                disabled={isNextLoading}
                className="text-muted-foreground hidden sm:inline-flex"
              >
                <SkipForward className="h-4 w-4 mr-1.5" />
                Skip
              </Button>
            )}
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className={cn(
                'gap-1.5 min-w-[120px]',
                isLastStep
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              {isNextLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isLastStep ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
