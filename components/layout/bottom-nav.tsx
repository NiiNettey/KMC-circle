"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, BookOpen, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/context/app-context"

const parentNavItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/track", icon: ClipboardList, label: "Track" },
  { href: "/learn", icon: BookOpen, label: "Learn" },
  { href: "/circle", icon: Users, label: "Circle", disabled: true },
  { href: "/profile", icon: User, label: "Profile" },
]

const nurseNavItems = [
  { href: "/nurse", icon: Home, label: "Home" },
  { href: "/nurse/patients", icon: Users, label: "Patients" },
  { href: "/nurse/pending", icon: ClipboardList, label: "Pending" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useApp()

  const navItems = user?.role === "nurse" ? nurseNavItems : parentNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div key={item.href} className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground/50">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
