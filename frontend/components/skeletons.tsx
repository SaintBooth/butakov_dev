import { Skeleton } from "@/components/ui/skeleton"

export function BentoSkeleton() {
  return (
    <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-full w-full rounded-2xl md:col-span-2" />
      <Skeleton className="h-full w-full rounded-2xl" />
      <Skeleton className="h-full w-full rounded-2xl" />
      <Skeleton className="h-full w-full rounded-2xl md:col-span-2" />
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-card/60 p-3 shadow-sm dark:border-white/10 dark:shadow-none">
      <Skeleton className="mb-3 h-40 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
      </div>
    </div>
  )
}

export function TextPageSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-2/3 rounded-lg" />
      {[...Array(8)].map((_, idx) => (
        <Skeleton
          key={idx}
          className="h-4 rounded-lg"
          style={{ width: `${90 - idx * 5}%` }}
        />
      ))}
    </div>
  )
}


