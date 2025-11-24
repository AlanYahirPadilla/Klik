import { AppLayout } from "@/components/layout/app-layout"
import { ProfileSkeleton } from "@/components/profile/profile-skeleton"
import { PostSkeletonList } from "@/components/feed/post-skeleton"

export default function ProfileLoading() {
  return (
    <AppLayout>
      <ProfileSkeleton />
      <div className="mx-auto max-w-2xl">
        <PostSkeletonList count={3} />
      </div>
    </AppLayout>
  )
}

