"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Heart, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context/app-context"
import { addPost } from "@/lib/storage"
import { toast } from "sonner"
import type { ForumType, Post } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useApp()
  const forumParam = searchParams.get("forum") as ForumType | null
  const [forumType, setForumType] = useState<ForumType>(forumParam || "moms")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!user) {
      toast.error("Please sign in to post")
      return
    }
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }
    if (!content.trim()) {
      toast.error("Please enter your message")
      return
    }

    setIsSubmitting(true)

    const newPost: Post = {
      id: crypto.randomUUID(),
      forumType,
      authorUserId: user.id,
      authorName: user.name,
      title: title.trim(),
      content: content.trim(),
      reactions: { heart: [], hug: [], pray: [], celebrate: [] },
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addPost(newPost)
    toast.success("Post created!")
    router.push("/circle")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background">
      {/* Header */}
      <div
        className={cn(
          "text-white px-4 pt-12 pb-8",
          forumType === "moms"
            ? "bg-gradient-to-r from-pink-500 to-rose-500"
            : "bg-gradient-to-r from-blue-500 to-indigo-500",
        )}
      >
        <div className="max-w-lg mx-auto">
          <Link href="/circle" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Circle</span>
          </Link>
          <h1 className="text-2xl font-bold">Share Your Story</h1>
          <p className="text-white/80 text-sm mt-1">Your experience can help others on this journey</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Forum Selection */}
            <div className="space-y-2">
              <Label>Post to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForumType("moms")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    forumType === "moms"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-muted hover:border-pink-200",
                  )}
                >
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">KMC for Moms</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForumType("dads")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    forumType === "dads"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-muted hover:border-blue-200",
                  )}
                >
                  <Baby className="h-5 w-5" />
                  <span className="font-medium">Dad's Corner</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Your Message</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts, questions, or experiences..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{content.length} characters</p>
            </div>

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className={cn(
                  "w-full",
                  forumType === "moms"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                )}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Share Post"}
              </Button>
            </motion.div>

            {/* Guidelines */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Community Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Be kind and supportive to fellow parents</li>
                <li>- Share experiences that might help others</li>
                <li>- Respect everyone's journey - it's different for each family</li>
                <li>- For medical concerns, always consult your healthcare provider</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
