'use client'

import { Button } from '@/components/ui/button'
import {
  GitFork,
  Download,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickActionsProps {
  hasCodeSnippet: boolean
  hasSourceUrl: boolean
  sourceUrl: string | null
  downloading: boolean
  onUseAsTemplate: () => void
  onDownload: (format: string) => void
}

export function QuickActions({
  hasCodeSnippet,
  hasSourceUrl,
  sourceUrl,
  downloading,
  onUseAsTemplate,
  onDownload,
}: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-wrap gap-3 mb-6"
    >
      <Button
        onClick={onUseAsTemplate}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 hover:scale-[1.02] transition-transform duration-200"
      >
        <GitFork className="h-4 w-4 mr-2" /> Use as Template
      </Button>
      <Button
        variant="outline"
        onClick={() => onDownload('code')}
        disabled={downloading || !hasCodeSnippet}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Download Code
      </Button>
      <Button
        variant="outline"
        onClick={() => onDownload('markdown')}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Export README
      </Button>
      <Button
        variant="outline"
        onClick={() => onDownload('zip')}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export Bundle
      </Button>
      {hasSourceUrl && sourceUrl && (
        <Button
          variant="outline"
          asChild
        >
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" /> View Source
          </a>
        </Button>
      )}
    </motion.div>
  )
}
