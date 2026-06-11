'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  GitFork,
  Share2,
  Download,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingActionBarProps {
  visible: boolean
  starred: boolean
  bookmarked: boolean
  bookmarkAnim: boolean
  downloading: boolean
  onStar: () => void
  onFork: () => void
  onShareLink: () => void
  onBookmarkToggle: () => void
  onDownload: () => void
}

export function FloatingActionBar({
  visible,
  starred,
  bookmarked,
  bookmarkAnim,
  downloading,
  onStar,
  onFork,
  onShareLink,
  onBookmarkToggle,
  onDownload,
}: FloatingActionBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border shadow-lg"
        >
          <motion.div
            animate={bookmarkAnim ? { scale: [1, 1.2, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={bookmarkAnim ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmarkToggle}
              className={`h-8 ${bookmarked ? 'text-amber-600' : ''}`}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 mr-1" />
              ) : (
                <Bookmark className="h-4 w-4 mr-1" />
              )}
              {bookmarked ? 'Saved' : 'Save'}
            </Button>
          </motion.div>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onStar}
            className={`h-8 ${starred ? 'text-amber-500' : ''}`}
          >
            <Star className={`h-4 w-4 mr-1 ${starred ? 'fill-amber-500' : ''}`} />
            {starred ? 'Starred' : 'Star'}
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onFork}
            className="h-8"
          >
            <GitFork className="h-4 w-4 mr-1" /> Fork
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onShareLink}
            className="h-8"
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            disabled={downloading}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
