"use client"

import { ArrowUpRight, Pause, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Technology {
  name: string;
  category: "frontend" | "backend" | "tools";
  description?: string;
}

interface StackSectionProps {
  title: string;
  technologies: Technology[];
  showStatistics?: boolean;
}

const categoryColors = {
  frontend: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30",
  backend: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30",
  tools: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30",
}

function TechBadge({ 
  name, 
  category, 
  description 
}: { 
  name: string; 
  category: "frontend" | "backend" | "tools"; 
  description?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false)
    }, 100)
  }

  return (
    <div className="relative">
      <span
        className={cn(
          "rounded-lg border px-4 py-2 transition hover:border-primary hover:text-primary cursor-help",
          categoryColors[category]
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {name}
      </span>
      {description && (
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
            >
              {description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

function Marquee({ 
  items, 
  isPaused, 
  onTogglePause 
}: { 
  items: Technology[]; 
  isPaused: boolean;
  onTogglePause: () => void;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl group">
      <div 
        className={cn(
          "animate-marquee flex min-w-full gap-6 px-6 py-4 text-sm font-medium uppercase tracking-tight text-muted-foreground",
          isPaused && "animation-play-state-paused"
        )}
        style={{
          animationPlayState: isPaused ? "paused" : "running"
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <TechBadge
            key={`${item.name}-${idx}`}
            name={item.name}
            category={item.category}
            description={item.description}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={onTogglePause}
        aria-label={isPaused ? "Play animation" : "Pause animation"}
      >
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
          width: max-content;
        }
        .animation-play-state-paused {
          animation-play-state: paused;
        }
      `}</style>
    </Card>
  )
}

export function StackSection({
  title,
  technologies,
  showStatistics = true,
}: StackSectionProps) {
  const [isPaused, setIsPaused] = useState(false)

  const categoryCounts = technologies.reduce((acc, tech) => {
    acc[tech.category] = (acc[tech.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalCount = technologies.length

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
      </div>
      <Marquee 
        items={technologies} 
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />
      {showStatistics && (
        <p className="text-sm text-muted-foreground text-center">
          {totalCount}+ технологий в стеке
        </p>
      )}
    </section>
  )
}
