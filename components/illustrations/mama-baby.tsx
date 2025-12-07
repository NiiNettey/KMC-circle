"use client"

import { motion } from "framer-motion"

interface MamaBabyIllustrationProps {
  className?: string
  variant?: "welcome" | "kmc" | "feeding" | "success" | "nurse"
}

export function MamaBabyIllustration({ className = "", variant = "welcome" }: MamaBabyIllustrationProps) {
  if (variant === "nurse") {
    return (
      <motion.svg
        viewBox="0 0 200 200"
        className={className}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Nurse with clipboard illustration */}
        <defs>
          <linearGradient id="nurseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6A1B9A" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="#F3E8FF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        {/* Body */}
        <motion.path
          d="M100 180 Q60 180 55 140 L55 120 Q55 100 75 95 L125 95 Q145 100 145 120 L145 140 Q140 180 100 180"
          fill="url(#nurseGrad)"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        {/* Head */}
        <motion.circle
          cx="100"
          cy="65"
          r="30"
          fill="#FCD5B8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        />
        {/* Nurse cap */}
        <motion.path
          d="M70 50 L100 35 L130 50 L125 55 L100 45 L75 55 Z"
          fill="white"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
        <motion.rect x="95" y="40" width="10" height="8" fill="#DC2626" rx="2" />
        {/* Smile */}
        <motion.path
          d="M90 72 Q100 80 110 72"
          stroke="#6A1B9A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        {/* Eyes */}
        <circle cx="88" cy="62" r="3" fill="#4A4A4A" />
        <circle cx="112" cy="62" r="3" fill="#4A4A4A" />
        {/* Clipboard */}
        <motion.g
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <rect x="130" y="105" width="30" height="40" fill="white" rx="3" stroke="#6A1B9A" strokeWidth="2" />
          <rect x="135" y="115" width="20" height="3" fill="#DDD" rx="1" />
          <rect x="135" y="122" width="15" height="3" fill="#DDD" rx="1" />
          <rect x="135" y="129" width="18" height="3" fill="#DDD" rx="1" />
        </motion.g>
        {/* Stethoscope */}
        <motion.path
          d="M85 95 Q80 110 85 120"
          stroke="#4A4A4A"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <circle cx="85" cy="123" r="5" fill="#4A4A4A" />
      </motion.svg>
    )
  }

  if (variant === "kmc") {
    return (
      <motion.svg
        viewBox="0 0 200 200"
        className={className}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id="kmcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3E8FF" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>
        </defs>
        {/* Soft glow background */}
        <motion.circle
          cx="100"
          cy="100"
          r="85"
          fill="url(#kmcGrad)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Mother silhouette */}
        <motion.path
          d="M70 180 Q50 180 45 140 L45 100 Q45 70 70 65 L70 55 Q70 40 100 40 Q130 40 130 55 L130 65 Q155 70 155 100 L155 140 Q150 180 130 180"
          fill="#6A1B9A"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        {/* Mother head */}
        <motion.circle
          cx="100"
          cy="55"
          r="25"
          fill="#FCD5B8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        />
        {/* Baby on chest */}
        <motion.ellipse
          cx="100"
          cy="115"
          rx="25"
          ry="30"
          fill="#FEE4E2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
        {/* Baby head */}
        <motion.circle
          cx="100"
          cy="95"
          r="15"
          fill="#FECACA"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        />
        {/* Hearts floating */}
        <motion.g
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <motion.path
            d="M145 70 C145 65 150 60 155 65 C160 60 165 65 165 70 C165 80 155 85 155 85 C155 85 145 80 145 70"
            fill="#EC4899"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          />
        </motion.g>
        <motion.g
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <motion.path
            d="M40 90 C40 86 44 82 48 86 C52 82 56 86 56 90 C56 98 48 102 48 102 C48 102 40 98 40 90"
            fill="#EC4899"
            opacity="0.7"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          />
        </motion.g>
        {/* Closed eyes - peaceful */}
        <motion.path d="M92 52 Q95 50 98 52" stroke="#6A1B9A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <motion.path d="M102 52 Q105 50 108 52" stroke="#6A1B9A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Gentle smile */}
        <motion.path d="M95 62 Q100 68 105 62" stroke="#6A1B9A" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (variant === "success") {
    return (
      <motion.svg
        viewBox="0 0 200 200"
        className={className}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="100%" stopColor="#BBF7D0" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#successGrad)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.path
          d="M60 100 L85 125 L140 70"
          stroke="#16A34A"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        {/* Sparkles */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <circle cx="45" cy="60" r="4" fill="#FCD34D" />
          <circle cx="155" cy="50" r="3" fill="#FCD34D" />
          <circle cx="160" cy="130" r="4" fill="#FCD34D" />
          <circle cx="35" cy="120" r="3" fill="#FCD34D" />
        </motion.g>
      </motion.svg>
    )
  }

  // Default: welcome variant
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
        <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="85"
        fill="url(#bgGrad)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />
      {/* Mother body */}
      <motion.path
        d="M100 180 Q55 180 50 130 L50 110 Q50 85 80 80 L120 80 Q150 85 150 110 L150 130 Q145 180 100 180"
        fill="url(#dressGrad)"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      {/* Mother head */}
      <motion.circle
        cx="100"
        cy="55"
        r="28"
        fill="#FCD5B8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
      {/* Hair */}
      <motion.path
        d="M72 50 Q72 25 100 25 Q128 25 128 50 Q128 35 100 35 Q72 35 72 50"
        fill="#4A3728"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      />
      {/* Baby in arms */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* Baby blanket */}
        <ellipse cx="100" cy="125" rx="30" ry="25" fill="white" />
        <ellipse cx="100" cy="125" rx="28" ry="23" fill="#FEF3C7" />
        {/* Baby head */}
        <circle cx="100" cy="108" r="14" fill="#FECACA" />
        {/* Baby face */}
        <circle cx="96" cy="106" r="2" fill="#4A4A4A" />
        <circle cx="104" cy="106" r="2" fill="#4A4A4A" />
        <path d="M97 112 Q100 114 103 112" stroke="#E57373" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </motion.g>
      {/* Mother eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 4 }}
      >
        <circle cx="90" cy="52" r="3" fill="#4A4A4A" />
        <circle cx="110" cy="52" r="3" fill="#4A4A4A" />
      </motion.g>
      {/* Mother smile */}
      <motion.path
        d="M90 65 Q100 75 110 65"
        stroke="#E57373"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      {/* Floating hearts */}
      <motion.g
        animate={{ y: [-3, 3, -3], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <path
          d="M150 60 C150 55 155 50 160 55 C165 50 170 55 170 60 C170 70 160 78 160 78 C160 78 150 70 150 60"
          fill="#EC4899"
        />
      </motion.g>
      <motion.g
        animate={{ y: [3, -3, 3], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
      >
        <path
          d="M35 75 C35 71 39 67 43 71 C47 67 51 71 51 75 C51 83 43 89 43 89 C43 89 35 83 35 75"
          fill="#EC4899"
          opacity="0.6"
        />
      </motion.g>
    </motion.svg>
  )
}
