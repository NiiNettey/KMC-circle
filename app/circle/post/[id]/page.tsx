"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Heart, Baby, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/context/app-context"
import { getPostById, getCommentsByPost, toggleReaction, addComment, toggleCommentReaction } from "@/lib/storage"
import { toast } from "sonner"
import type { Post, Comment, ReactionType } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const REACTION_ICONS: Record<ReactionType, { icon: string; label: string }> = {
  heart: { icon: "❤️", label: "Love" },
  hug: { icon: "🤗", label: "Hug" },
  pray: { icon: "🙏", label: "Prayers" },
  celebrate: { icon: "🎉", label: "Celebrate" },
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useApp()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const postData = getPostById(params.id as string)
    if (postData) {
      setPost(postData)
      setComments(getCommentsByPost(postData.id))
    }
  }, [params.id])

  const refreshData = () => {
    const postData = getPostById(params.id as string)
    if (postData) {
      setPost(postData)
      setComments(getCommentsByPost(postData.id))
    }
  }

  const handleReaction = (reactionType: ReactionType) => {
    if (!user || !post) return
    toggleReaction(post.id, reactionType, user.id)
    refreshData()
  }

  const handleCommentReaction = (commentId: string, reactionType: ReactionType) => {
    if (!user) return
    toggleCommentReaction(commentId, reactionType, user.id)
    refreshData()
  }

  const handleSubmitComment = () => {
    if (!user || !post) {
      toast.error("Please sign in to comment")
      return
    }
    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    setIsSubmitting(true)

    const comment: Comment = {
      id: crypto.randomUUID(),
      postId: post.id,
      authorUserId: user.id,
      authorName: user.name,
      content: newComment.trim(),
      reactions: { heart: [], hug: [], pray: [], celebrate: [] },
      createdAt: new Date().toISOString(),
    }

    addComment(comment)
    setNewComment("")
    setIsSubmitting(false)
    toast.success("Comment added!")
    refreshData()
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  const isMomsForum = post.forumType === "moms"

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background pb-8">
      {/* Header */}
      <div
        className={cn(
          "text-white px-4 pt-12 pb-6",
          isMomsForum ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500",
        )}
      >
        <div className="max-w-lg mx-auto">
          <Link href="/circle" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Circle</span>
          </Link>
          <div className="flex items-center gap-2">
            {isMomsForum ? <Heart className="h-5 w-5" /> : <Baby className="h-5 w-5" />}
            <span className="text-sm font-medium">{isMomsForum ? "KMC for Moms" : "Dad's Corner"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Post Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className={cn("h-12 w-12 border-2", isMomsForum ? "border-pink-200" : "border-blue-200")}>
                <AvatarFallback
                  className={cn(
                    "text-lg font-semibold",
                    isMomsForum ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700",
                  )}
                >
                  {post.authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{post.authorName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <h1 className="text-xl font-bold text-foreground mb-3">{post.title}</h1>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {/* Reactions */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t">
              {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => {
                const count = post.reactions[type]?.length || 0
                const hasReacted = user && post.reactions[type]?.includes(user.id)
                return (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction(type)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                      hasReacted
                        ? isMomsForum
                          ? "bg-pink-100 text-pink-700 border border-pink-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-muted hover:bg-muted/80",
                    )}
                  >
                    <span className="text-base">{REACTION_ICONS[type].icon}</span>
                    <span>{count > 0 ? count : REACTION_ICONS[type].label}</span>
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className={cn("h-5 w-5", isMomsForum ? "text-pink-500" : "text-blue-500")} />
              <h2 className="font-semibold">
                {comments.length} {comments.length === 1 ? "Response" : "Responses"}
              </h2>
            </div>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your support or advice..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className={cn(
                    isMomsForum
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                  )}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No responses yet. Be the first to offer support!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className={cn(
                          "text-sm",
                          isMomsForum ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700",
                        )}
                      >
                        {comment.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>

                      {/* Comment Reactions */}
                      <div className="flex items-center gap-1 mt-1 ml-2">
                        {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => {
                          const count = comment.reactions[type]?.length || 0
                          const hasReacted = user && comment.reactions[type]?.includes(user.id)
                          return (
                            <button
                              key={type}
                              onClick={() => handleCommentReaction(comment.id, type)}
                              className={cn(
                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors",
                                hasReacted ? "bg-primary/10 text-primary" : "hover:bg-muted",
                              )}
                            >
                              <span>{REACTION_ICONS[type].icon}</span>
                              {count > 0 && <span>{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
