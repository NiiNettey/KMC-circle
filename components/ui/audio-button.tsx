"use client"

import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context/app-context"
import { cn } from "@/lib/utils"

interface AudioButtonProps {
  audioKey: string
  className?: string
  size?: "sm" | "default"
}

export function AudioButton({ audioKey, className, size = "sm" }: AudioButtonProps) {
  const { user, playAudio } = useApp()

  // Only show for non-English locales
  if (!user || user.locale === "en") return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", size === "sm" ? "h-8 w-8" : "h-10 w-10", className)}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        playAudio(audioKey)
      }}
      aria-label="Play audio instruction"
    >
      <Volume2 className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </Button>
  )
}
