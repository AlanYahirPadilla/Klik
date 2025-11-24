import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-6 py-5">
        <Skeleton className="h-8 w-48" />
      </header>

      <div className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
        {/* Banner */}
        <div className="relative w-full h-48 bg-muted">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="px-6 pb-6">
          <div className="mb-6 flex items-start justify-between -mt-12">
            <Skeleton className="h-24 w-24 rounded-full ring-4 ring-background" />
          </div>

          <div className="mb-4 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>

          <Skeleton className="h-16 w-full mb-5" />

          <div className="mb-5 flex gap-8">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

