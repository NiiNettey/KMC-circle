"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AudioButton } from "@/components/ui/audio-button"
import { ArrowLeft, Volume2, Baby, Heart, Droplets, Users, Shield, User } from "lucide-react"
import { getEduContent } from "@/lib/storage"
import type { EduCategory, EduItem } from "@/lib/types"

const categoryIcons: Record<EduCategory, React.ReactNode> = {
  "KMC Basics": <Baby className="h-5 w-5" />,
  Breastfeeding: <Heart className="h-5 w-5" />,
  Hygiene: <Droplets className="h-5 w-5" />,
  Support: <Users className="h-5 w-5" />,
  Safety: <Shield className="h-5 w-5" />,
  "Dads Corner": <User className="h-5 w-5" />,
}

export default function LearnArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, playAudio } = useApp()
  const [article, setArticle] = useState<EduItem | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<EduItem[]>([])

  const articleId = params.id as string

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const content = getEduContent()
    const found = content.find((item) => item.id === articleId)
    setArticle(found || null)

    if (found) {
      const related = content.filter((item) => item.category === found.category && item.id !== found.id).slice(0, 3)
      setRelatedArticles(related)
    }
  }, [articleId])

  const handlePlayAudio = () => {
    if (article && user?.locale && user.locale !== "en") {
      const audioFile = article.audioFiles[user.locale]
      if (audioFile) {
        const audio = new Audio(audioFile)
        audio.play().catch(() => {
          playAudio(`article-${article.id}`)
        })
      } else {
        playAudio(`article-${article.id}`)
      }
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold mb-2">Article Not Found</h1>
        <Button asChild>
          <Link href="/learn">Back to Learn</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/learn">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold line-clamp-1">{article.title}</h1>
          </div>
          {user.locale !== "en" && (
            <Button variant="ghost" size="icon" onClick={handlePlayAudio}>
              <Volume2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Article Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {categoryIcons[article.category as EduCategory]}
            </div>
            <div>
              <Badge variant="secondary">{article.category}</Badge>
              <p className="text-xs text-muted-foreground mt-1">{article.contentType}</p>
            </div>
          </div>

          {/* Audio Play Button for non-English users */}
          {user.locale !== "en" && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center gap-3 p-4">
                <Button onClick={handlePlayAudio} className="gap-2">
                  <Volume2 className="h-4 w-4" />
                  Listen in {user.locale === "tw" ? "Twi" : user.locale === "ga" ? "Ga" : "Ewe"}
                </Button>
                <p className="text-sm text-muted-foreground flex-1">Tap to hear this article read aloud</p>
              </CardContent>
            </Card>
          )}

          {/* Article Content */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{article.title}</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{article.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-muted-foreground">Related Articles</h3>
              <div className="space-y-2">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/learn/${related.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {categoryIcons[related.category as EduCategory]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{related.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{related.category}</p>
                        </div>
                        <AudioButton audioKey={`article-${related.id}`} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
