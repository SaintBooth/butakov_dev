"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps {
  children: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export function Heading1({ children, gradient, className }: HeadingProps) {
  if (gradient) {
    return (
      <h1 className={cn(
        "text-4xl md:text-5xl font-bold tracking-tight",
        "bg-gradient-to-r from-white via-white to-[#0FD4C8] bg-clip-text text-transparent",
        className
      )}>
        {children}
      </h1>
    );
  }
  return (
    <h1 className={cn(
      "text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className }: Omit<HeadingProps, "gradient">) {
  return (
    <h2 className={cn(
      "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className }: Omit<HeadingProps, "gradient">) {
  return (
    <h3 className={cn(
      "text-xl font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h3>
  );
}

export function Heading4({ children, className }: Omit<HeadingProps, "gradient">) {
  return (
    <h4 className={cn(
      "text-lg font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h4>
  );
}

export function Heading5({ children, className }: Omit<HeadingProps, "gradient">) {
  return (
    <h5 className={cn(
      "text-base font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h5>
  );
}

export function Heading6({ children, className }: Omit<HeadingProps, "gradient">) {
  return (
    <h6 className={cn(
      "text-sm font-bold tracking-tight text-slate-900 dark:text-white",
      className
    )}>
      {children}
    </h6>
  );
}

interface BodyTextProps {
  children: React.ReactNode;
  className?: string;
}

export function BodyText({ children, className }: BodyTextProps) {
  return (
    <p className={cn(
      "text-slate-600 dark:text-slate-300 leading-relaxed",
      className
    )}>
      {children}
    </p>
  );
}
