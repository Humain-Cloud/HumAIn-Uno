'use client'

import { useState } from 'react'
import { useAppStore, type Notification, type NotificationType } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Bell,
  CheckCheck,
  Trash2,
  Bot,
  Sparkles,
  BookOpen,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  agent_update: <RefreshCw className="h-3.5 w-3.5" />,
  new_agent: <Bot className="h-3.5 w-3.5" />,
  bookmark_reminder: <BookOpen className="h-3.5 w-3.5" />,
  system: <Sparkles className="h-3.5 w-3.5" />,
}

const notificationColors: Record<NotificationType, string> = {
  agent_update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  new_agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  bookmark_reminder: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  system: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
      }`}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id)
      }}
    >
      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
        {notificationIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-tight ${!notification.read ? '' : 'text-muted-foreground'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTimeAgo(notification.createdAt)}</p>
      </div>
    </motion.div>
  )
}

export function NotificationCenter() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAppStore()

  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    toast({
      title: 'All notifications marked as read',
      description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read.`,
    })
  }

  const handleClearAll = () => {
    clearNotifications()
    toast({
      title: 'Notifications cleared',
      description: 'All notifications have been removed.',
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 min-h-[36px] min-w-[36px] btn-hover relative"
        >
          <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 lg:w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                  {unreadCount} new
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-600 text-xs h-7 px-2"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs h-7 px-2 hover:text-destructive"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">We&apos;ll notify you when something happens</p>
            </div>
          ) : (
            <div className="py-1">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markNotificationRead}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-900/50">
            <p className="text-[10px] text-muted-foreground text-center">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · {unreadCount} unread
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
