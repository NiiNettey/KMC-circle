"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApp } from "@/lib/context/app-context"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AudioButton } from "@/components/ui/audio-button"
import { Search, Baby, Heart, Droplets, Users, Shield, User } from "lucide-react"
import { getEduContent } from "@/lib/storage"
import type { EduCategory, EduItem } from "@/lib/types"

const categoryIcons: Record<EduCategory, React.ReactNode> = {
  "KMC Basics": <Baby className="h-6 w-6" />,
  Breastfeeding: <Heart className="h-6 w-6" />,
  Hygiene: <Droplets className="h-6 w-6" />,
  Support: <Users className="h-6 w-6" />,
  Safety: <Shield className="h-6 w-6" />,
  "Dads Corner": <User className="h-6 w-6" />,
}

const categoryColors: Record<EduCategory, string> = {
  "KMC Basics": "bg-primary/10 text-primary",
  Breastfeeding: "bg-pink-100 text-pink-600",
  Hygiene: "bg-blue-100 text-blue-600",
  Support: "bg-green-100 text-green-600",
  Safety: "bg-amber-100 text-amber-600",
  "Dads Corner": "bg-indigo-100 text-indigo-600",
}

const categoryAudioKeys: Record<EduCategory, string> = {
  "KMC Basics": "edu-kmc-basics",
  Breastfeeding: "edu-breastfeeding",
  Hygiene: "edu-hygiene",
  Support: "edu-support",
  Safety: "edu-safety",
  "Dads Corner": "edu-dads",
}

export default function LearnPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()
  const [eduContent, setEduContent] = useState<EduItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<EduCategory | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setEduContent(getEduContent())
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<EduCategory>()
    eduContent.forEach((item) => cats.add(item.category))
    return Array.from(cats)
  }, [eduContent])

  const filteredContent = useMemo(() => {
    let filtered = eduContent

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [eduContent, selectedCategory, searchQuery])

  const contentByCategory = useMemo(() => {
    const grouped: Record<string, EduItem[]> = {}
    filteredContent.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [filteredContent])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="Learn" />

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Grid */}
          {!selectedCategory && !searchQuery && (
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105 ${categoryColors[category]}`}
                >
                  {categoryIcons[category]}
                  <span className="text-xs font-medium text-center leading-tight">{category}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Category Header */}
          {selectedCategory && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${categoryColors[selectedCategory]}`}>
                  {categoryIcons[selectedCategory]}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedCategory}</h2>
                  <p className="text-xs text-muted-foreground">
                    {contentByCategory[selectedCategory]?.length || 0} articles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AudioButton audioKey={categoryAudioKeys[selectedCategory]} size="default" />
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-primary hover:underline"
                >
                  All Categories
                </button>
              </div>
            </div>
          )}

          {/* Articles List */}
          {Object.entries(contentByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2">
              {!selectedCategory && (
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category as EduCategory)}
                    className="text-xs text-primary hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {items.slice(0, selectedCategory ? undefined : 2).map((item) => (
                  <Link key={item.id} href={`/learn/${item.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={`rounded-lg p-2 ${categoryColors[item.category as EduCategory]}`}>
                          {categoryIcons[item.category as EduCategory]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{item.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredContent.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Articles Found</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Try a different search term or browse by category
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
