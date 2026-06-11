'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  Loader2,
  Heart,
  MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockComment } from './shared-data'

interface CommentsTabProps {
  comments: MockComment[]
  commentText: string
  submittingComment: boolean
  isAuthenticated: boolean
  commentSort: 'newest' | 'oldest' | 'most-liked'
  onCommentTextChange: (text: string) => void
  onComment: () => void
  onLikeComment: (id: string) => void
  onReplyToComment: (commentId: string, replyText: string) => void
  onCommentSortChange: (sort: 'newest' | 'oldest' | 'most-liked') => void
  sortedComments: MockComment[]
}

export function CommentsTab({
  comments,
  commentText,
  submittingComment,
  isAuthenticated,
  commentSort,
  onCommentTextChange,
  onComment,
  onLikeComment,
  onReplyToComment,
  onCommentSortChange,
  sortedComments,
}: CommentsTabProps) {
  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                {isAuthenticated ? 'YO' : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={isAuthenticated ? "Write a comment..." : "Sign in to comment"}
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                disabled={!isAuthenticated}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {commentText.length > 0 ? `${commentText.length} characters` : ''}
                </p>
                <Button
                  size="sm"
                  disabled={!commentText.trim() || !isAuthenticated || submittingComment}
                  onClick={onComment}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </p>
        <Select value={commentSort} onValueChange={(v: any) => onCommentSortChange(v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-liked">Most Liked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      <AnimatePresence mode="popLayout">
        {sortedComments.length > 0 ? (
          <div className="space-y-3">
            {sortedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLike={onLikeComment}
                onReply={onReplyToComment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Comment Card Component
function CommentCard({
  comment,
  onLike,
  onReply,
  depth = 0,
}: {
  comment: MockComment
  onLike: (id: string) => void
  onReply: (commentId: string, replyText: string) => void
  depth?: number
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const avatarColors = [
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  ]

  const colorIndex = comment.author.charCodeAt(0) % avatarColors.length

  const handleSubmitReply = () => {
    if (!replyText.trim()) return
    onReply(comment.id, replyText)
    setReplyText('')
    setReplyOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}
    >
      <Card className={depth > 0 ? 'shadow-none' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`text-xs ${avatarColors[colorIndex]}`}>
                {comment.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    comment.liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${comment.liked ? 'fill-rose-500' : ''}`} />
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                </button>
                {depth === 0 && (
                  <button
                    onClick={() => setReplyOpen(!replyOpen)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Reply
                  </button>
                )}
              </div>

              {/* Reply input */}
              {replyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 flex items-start gap-2"
                >
                  <Input
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitReply()
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {comment.replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      onLike={onLike}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
