"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Users, Baby, MessageCircle, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useApp } from "@/lib/context/app-context"
import { getPostsByForum, toggleReaction } from "@/lib/storage"
import type { ForumType, Post, ReactionType } from "@/lib/types"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const REACTION_ICONS: Record<ReactionType, { icon: string; label: string }> = {
  heart: { icon: "❤️", label: "Love" },
  hug: { icon: "🤗", label: "Hug" },
  pray: { icon: "🙏", label: "Prayers" },
  celebrate: { icon: "🎉", label: "Celebrate" },
}

export default function CirclePage() {
  const { user } = useApp()
  const [activeForum, setActiveForum] = useState<ForumType>("moms")
  const [posts, setPosts] = useState<Post[]>(() => getPostsByForum("moms"))

  const switchForum = (forum: ForumType) => {
    setActiveForum(forum)
    setPosts(getPostsByForum(forum))
  }

  const handleReaction = (postId: string, reactionType: ReactionType) => {
    if (!user) return
    toggleReaction(postId, reactionType, user.id)
    setPosts(getPostsByForum(activeForum))
  }

  const getTotalReactions = (reactions: Record<ReactionType, string[]>) => {
    return Object.values(reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-700 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Circle</h1>
          </div>
          <p className="text-purple-100 text-sm">Connect with other parents on this journey</p>
        </div>
      </div>

      {/* Forum Tabs */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
          <button
            onClick={() => switchForum("moms")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
              activeForum === "moms"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-pink-50",
            )}
          >
            <Heart className="h-5 w-5" />
            <span>KMC for Moms</span>
          </button>
          <button
            onClick={() => switchForum("dads")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
              activeForum === "dads"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-blue-50",
            )}
          >
            <Baby className="h-5 w-5" />
            <span>Dad's Corner</span>
          </button>
        </div>
      </div>

      {/* Forum Content */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeForum}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Forum Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className={cn("h-5 w-5", activeForum === "moms" ? "text-pink-500" : "text-blue-500")} />
                <span className="font-medium text-foreground">
                  {activeForum === "moms" ? "Mama Stories" : "Dad Talks"}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {posts.length} posts
              </Badge>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                      activeForum === "moms" ? "bg-pink-100" : "bg-blue-100",
                    )}
                  >
                    <MessageCircle
                      className={cn("h-8 w-8", activeForum === "moms" ? "text-pink-500" : "text-blue-500")}
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Be the first to share your story or ask a question
                  </p>
                  <Link href={`/circle/new?forum=${activeForum}`}>
                    <Button
                      className={cn(
                        activeForum === "moms"
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                      )}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/circle/post/${post.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                        <CardContent className="p-4">
                          {/* Author Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar
                              className={cn(
                                "h-10 w-10 border-2",
                                activeForum === "moms" ? "border-pink-200" : "border-blue-200",
                              )}
                            >
                              <AvatarFallback
                                className={cn(
                                  "font-semibold",
                                  activeForum === "moms" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700",
                                )}
                              >
                                {post.authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{post.authorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.content}</p>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-1">
                              {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => {
                                const count = post.reactions[type]?.length || 0
                                const hasReacted = user && post.reactions[type]?.includes(user.id)
                                if (count === 0 && !hasReacted) return null
                                return (
                                  <button
                                    key={type}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleReaction(post.id, type)
                                    }}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                                      hasReacted ? "bg-primary/10 text-primary" : "bg-muted hover:bg-muted/80",
                                    )}
                                  >
                                    <span>{REACTION_ICONS[type].icon}</span>
                                    <span>{count}</span>
                                  </button>
                                )
                              })}
                              {getTotalReactions(post.reactions) === 0 && (
                                <span className="text-xs text-muted-foreground">No reactions yet</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">{post.commentCount || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <Link href={`/circle/new?forum=${activeForum}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white",
            activeForum === "moms"
              ? "bg-gradient-to-r from-pink-500 to-rose-500"
              : "bg-gradient-to-r from-blue-500 to-indigo-500",
          )}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </Link>

      <BottomNav />
    </div>
  )
}
