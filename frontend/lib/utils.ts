import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind/clsx class strings safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

