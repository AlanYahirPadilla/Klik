import { AppLayout } from "@/components/layout/app-layout"
import { PostSkeletonList } from "@/components/feed/post-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeedLoading() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-6 py-5">
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </header>

            {/* Create post skeleton */}
            <div className="border-b border-border/40 bg-card px-6 py-4">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <PostSkeletonList count={5} />
          </div>

          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="bg-card border border-border/40 rounded-lg p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}

