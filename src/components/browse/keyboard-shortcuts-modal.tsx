'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-emerald-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {[
            { keys: ['/', 'Search'], desc: 'Focus search input' },
            { keys: ['Esc'], desc: 'Clear search and blur input' },
            { keys: ['g', 'b'], desc: 'Go to Browse view' },
            { keys: ['?'], desc: 'Show this help dialog' },
          ].map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{shortcut.desc}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, ki) => (
                  <span key={ki}>
                    {ki > 0 && <span className="text-xs text-muted-foreground mx-0.5">then</span>}
                    <kbd className="inline-flex items-center justify-center h-6 px-2 text-xs font-mono bg-muted border rounded-md">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
