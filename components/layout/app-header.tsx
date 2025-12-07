"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context/app-context"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  title?: string
  showNotifications?: boolean
}

export function AppHeader({ title, showNotifications = true }: AppHeaderProps) {
  const { user, notifications, currentBaby } = useApp()

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayTitle = title || (currentBaby ? currentBaby.babyName : "Mama's Circle")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-bold">{user?.name?.charAt(0) || "M"}</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">{displayTitle}</h1>
            {currentBaby && (
              <p className="text-xs text-muted-foreground">
                {currentBaby.status === "pending_nurse_approval" ? "Awaiting nurse" : "With nurse"}
              </p>
            )}
          </div>
        </div>

        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </header>
  )
}
