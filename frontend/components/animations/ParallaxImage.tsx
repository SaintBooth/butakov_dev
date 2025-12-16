"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image, { ImageProps } from "next/image"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ParallaxImageProps extends Omit<ImageProps, "ref"> {
  intensity?: number;
}

export function ParallaxImage({ 
  intensity = 0.5,
  className,
  fill,
  ...props 
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * intensity])

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (prefersReducedMotion) {
    return (
      <div className={cn("relative", className)}>
        <Image {...props} fill={fill} />
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className={fill ? "absolute inset-0" : ""}>
        <Image {...props} fill={fill} loading="lazy" />
      </motion.div>
    </div>
  )
}
