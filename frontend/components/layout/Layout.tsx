"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode;
  isLanding?: boolean;
  contentMaxWidth?: string;
}

export function Layout({ 
  children, 
  isLanding = false,
  contentMaxWidth 
}: LayoutProps) {
  const containerClasses = isLanding
    ? "" // Float layout - no max-width constraint
    : cn("mx-auto px-4 sm:px-6", contentMaxWidth || "max-w-5xl");

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Global Background Effects (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
      </div>

      {/* Main Content Area */}
      <main className={cn("relative z-10 pt-20", containerClasses)}>
        {children}
      </main>
    </div>
  );
}
