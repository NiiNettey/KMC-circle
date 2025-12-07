"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ConfettiProps {
  trigger?: boolean
}

export function Confetti({ trigger = true }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string }>>([])

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#7C3AED", "#EC4899", "#FCD34D", "#34D399", "#60A5FA"][Math.floor(Math.random() * 5)],
      }))
      setParticles(newParticles)
    }
  }, [trigger])

  if (!trigger || particles.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: "100vh",
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}
