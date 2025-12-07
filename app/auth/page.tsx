"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AudioButton } from "@/components/ui/audio-button"
import { toast } from "sonner"
import type { Language, UserRole } from "@/lib/types"
import { getUserByUsername, getBabiesByMother } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { User, Stethoscope, ChevronRight, ChevronLeft, Heart, Baby, Shield } from "lucide-react"

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "tw", label: "Twi" },
  { value: "ga", label: "Ga" },
  { value: "ew", label: "Ewe" },
]

export default function AuthPage() {
  const router = useRouter()
  const { login, signup } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"signup" | "login">("signup")

  // Login form
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form
  const [signupStep, setSignupStep] = useState<"role" | "details">("role")
  const [signupRole, setSignupRole] = useState<UserRole | null>(null)
  const [signupUsername, setSignupUsername] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupLocale, setSignupLocale] = useState<Language>("en")
  const [signupFacility, setSignupFacility] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = login(loginUsername, loginPassword)

    if (result.success) {
      toast.success("Welcome back!")
      const foundUser = getUserByUsername(loginUsername)

      if (foundUser?.role === "nurse") {
        router.push("/nurse")
      } else if (foundUser) {
        const userBabies = getBabiesByMother(foundUser.id)
        if (userBabies.length === 0) {
          router.push("/setup-baby")
        } else {
          router.push("/dashboard")
        }
      }
    } else {
      toast.error(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!signupUsername || !signupPassword || !signupName || !signupRole) {
      toast.error("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (signupRole === "nurse" && !signupFacility) {
      toast.error("Please enter your facility name")
      setIsLoading(false)
      return
    }

    const locale = signupRole === "nurse" ? "en" : signupLocale

    const result = signup(
      signupUsername,
      signupPassword,
      signupName,
      locale,
      signupRole,
      signupRole === "nurse" ? signupFacility : undefined,
    )

    if (result.success) {
      toast.success("Account created!")
      if (signupRole === "nurse") {
        router.push("/nurse")
      } else {
        router.push("/setup-baby")
      }
    } else {
      toast.error(result.error || "Signup failed")
    }

    setIsLoading(false)
  }

  const handleSelectRole = (role: UserRole) => {
    setSignupRole(role)
    setSignupStep("details")
  }

  const resetSignup = () => {
    setSignupStep("role")
    setSignupRole(null)
    setSignupUsername("")
    setSignupPassword("")
    setSignupName("")
    setSignupFacility("")
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Animated icons */}
          <div className="relative mb-8">
            <motion.div
              className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <Baby className="w-16 h-16 text-white" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Heart className="w-6 h-6 text-primary" />
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">Mama's Circle</h1>
          <p className="text-xl text-white/90 mb-8 text-center">Nurturing Preterm Babies with Love</p>

          {/* Feature highlights */}
          <div className="space-y-4 max-w-sm">
            <motion.div
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Track KMC Sessions</p>
                <p className="text-sm text-white/70">Log skin-to-skin time with ease</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Nurse Support</p>
                <p className="text-sm text-white/70">Connected care from professionals</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Safe & Private</p>
                <p className="text-sm text-white/70">Your data stays with you</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Mobile header - only show on small screens */}
        <div className="lg:hidden p-6 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Baby className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-primary">Mama's Circle</h1>
          <p className="text-muted-foreground text-sm">Nurturing Preterm Babies with Love</p>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {mode === "signup" ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {signupStep === "role" ? (
                    <div className="space-y-6">
                      <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-foreground">Join Mama's Circle</h2>
                        <p className="text-muted-foreground mt-1">Select how you'll be using the app</p>
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={() => handleSelectRole("parent")}
                          className="w-full rounded-2xl border-2 border-transparent bg-white/80 dark:bg-card/80 backdrop-blur-sm p-5 text-left shadow-lg transition-all hover:border-primary hover:shadow-xl"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80">
                              <User className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-foreground">I'm a Parent</p>
                              <p className="text-sm text-muted-foreground">Track my baby's KMC journey</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => handleSelectRole("nurse")}
                          className="w-full rounded-2xl border-2 border-transparent bg-white/80 dark:bg-card/80 backdrop-blur-sm p-5 text-left shadow-lg transition-all hover:border-primary hover:shadow-xl"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/80">
                              <Stethoscope className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-foreground">I'm a Nurse</p>
                              <p className="text-sm text-muted-foreground">Support mothers and track patients</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </motion.button>
                      </div>

                      <div className="pt-4 text-center">
                        <p className="text-muted-foreground">
                          Already have an account?{" "}
                          <button
                            onClick={() => setMode("login")}
                            className="text-primary font-semibold hover:underline"
                          >
                            Sign in
                          </button>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-6">
                      <div>
                        <button
                          type="button"
                          onClick={() => setSignupStep("role")}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${signupRole === "nurse" ? "bg-secondary" : "bg-primary"}`}
                          >
                            {signupRole === "nurse" ? (
                              <Stethoscope className="h-6 w-6 text-primary" />
                            ) : (
                              <User className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              {signupRole === "nurse" ? "Nurse Registration" : "Parent Registration"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {signupRole === "nurse"
                                ? "Create your healthcare account"
                                : "Create your account to start"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Your Name</Label>
                          <Input
                            id="signup-name"
                            placeholder="Enter your full name"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="h-12 bg-background/50"
                          />
                        </div>

                        {signupRole === "nurse" && (
                          <div className="space-y-2">
                            <Label htmlFor="signup-facility">Facility / Hospital</Label>
                            <Input
                              id="signup-facility"
                              placeholder="Enter your workplace"
                              value={signupFacility}
                              onChange={(e) => setSignupFacility(e.target.value)}
                              className="h-12 bg-background/50"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="signup-username">Username</Label>
                          <Input
                            id="signup-username"
                            placeholder="Choose a username"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value)}
                            autoComplete="username"
                            className="h-12 bg-background/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Choose a password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            autoComplete="new-password"
                            className="h-12 bg-background/50"
                          />
                        </div>

                        {signupRole === "parent" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="signup-locale">Language</Label>
                              <AudioButton audioKey="select-language" />
                            </div>
                            <Select value={signupLocale} onValueChange={(v) => setSignupLocale(v as Language)}>
                              <SelectTrigger className="h-12 bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>

                      <p className="text-center text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login")
                            resetSignup()
                          }}
                          className="text-primary font-semibold hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-center lg:text-left">
                      <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                      <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
                    </div>

                    <div className="space-y-4 bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          placeholder="Enter username"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          autoComplete="username"
                          className="h-12 bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="current-password"
                          className="h-12 bg-background/50"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base rounded-xl shadow-lg" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>

                    {/* Demo accounts info */}
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">Demo Accounts</p>
                      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">Parent</p>
                          <p className="font-mono">mom / mom</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Nurse</p>
                          <p className="font-mono">nurse1 / nurse1</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-xs text-muted-foreground">
          <p>Supporting preterm babies with love and care</p>
        </div>
      </div>
    </div>
  )
}
