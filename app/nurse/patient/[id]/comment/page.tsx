"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, MessageSquare, Check } from "lucide-react"
import { getBabyById, addNotification } from "@/lib/storage"
import type { Baby, CommentLog } from "@/lib/types"
import { v4 as uuid } from "uuid"

export default function NurseCommentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, addLog } = useApp()
  const [baby, setBaby] = useState<Baby | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const babyId = params.id as string

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "nurse")) {
      router.replace("/auth")
      return
    }

    if (babyId) {
      const foundBaby = getBabyById(babyId)
      if (foundBaby) {
        setBaby(foundBaby)
      }
    }
  }, [user, isLoading, router, babyId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !baby || !comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    setIsSubmitting(true)

    const logEntry: Omit<CommentLog, "id" | "timestamp"> = {
      babyId: baby.id,
      authorUserId: user.id,
      authorRole: "nurse",
      type: "comment",
      parentLogId: "",
      nurseComment: null,
      immutable: false,
      data: {
        comment: comment.trim(),
      },
    }

    addLog(logEntry)

    // Notify mother
    addNotification({
      id: uuid(),
      userId: baby.motherUserId,
      type: "reminder",
      title: "New Note from Nurse",
      message: `${user.name} left a note for ${baby.babyName}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { babyId: baby.id },
    })

    toast.success("Note added successfully")
    router.push(`/nurse/patient/${baby.id}`)
  }

  if (isLoading || !user || !baby) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/nurse/patient/${baby.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Add Note</h1>
            <p className="text-xs text-muted-foreground">{baby.babyName}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Nurse Note
              </CardTitle>
              <CardDescription>Add a comment or observation for the mother to see</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Note</Label>
                  <Textarea
                    id="comment"
                    placeholder="Enter your observation, encouragement, or instructions..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This note will be visible to the mother in the baby&apos;s log history.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !comment.trim()}>
                  <Check className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Note"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
