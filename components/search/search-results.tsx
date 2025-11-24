"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostCard } from "@/components/feed/post-card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { Hash } from "lucide-react"

interface SearchResultsProps {
  query: string
  type: string
  currentUserId: string
}

export function SearchResults({ query, type, currentUserId }: SearchResultsProps) {
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeType = type || "all"

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true)
      const supabase = createClient()

      try {
        // Search users
        if (activeType === "all" || activeType === "users") {
          const { data: usersData } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, email_verified, official_verified, role")
            .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
            .limit(10)

          setUsers(usersData || [])
        }

        // Search posts
        if (activeType === "all" || activeType === "posts") {
          const { data: postsData } = await supabase
            .from("posts")
            .select(
              `
              *,
              profiles:author_id (
                id,
                username,
                display_name,
                avatar_url,
                email_verified,
                official_verified,
                role
              ),
              likes:likes(count),
              comments:comments(count)
            `
            )
            .ilike("content", `%${query}%`)
            .order("created_at", { ascending: false })
            .limit(20)

          // Get user likes and saves
          const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", currentUserId)
          const { data: userSaves } = await supabase.from("saved_posts").select("post_id").eq("user_id", currentUserId)

          const likedPostIds = new Set(userLikes?.map((like) => like.post_id) || [])
          const savedPostIds = new Set(userSaves?.map((save) => save.post_id) || [])

          const postsWithCounts =
            postsData?.map((post) => ({
              id: post.id,
              content: post.content,
              image_url: post.image_url,
              created_at: post.created_at,
              author: {
                id: post.profiles.id,
                username: post.profiles.username,
                display_name: post.profiles.display_name,
                avatar_url: post.profiles.avatar_url,
                email_verified: post.profiles.email_verified,
                official_verified: post.profiles.official_verified,
                role: post.profiles.role,
              },
              likes_count: post.likes?.[0]?.count || 0,
              comments_count: post.comments?.[0]?.count || 0,
              is_liked: likedPostIds.has(post.id),
              is_saved: savedPostIds.has(post.id),
            })) || []

          setPosts(postsWithCounts)
        }

        // Search hashtags (extract from posts)
        if (activeType === "all" || activeType === "hashtags") {
          const hashtagPattern = /#(\w+)/g
          const { data: postsData } = await supabase
            .from("posts")
            .select("content")
            .ilike("content", `%#${query}%`)
            .limit(100)

          const foundHashtags = new Set<string>()
          postsData?.forEach((post) => {
            const matches = post.content.match(hashtagPattern)
            matches?.forEach((match) => {
              const tag = match.toLowerCase().replace("#", "")
              if (tag.includes(query.toLowerCase())) {
                foundHashtags.add(tag)
              }
            })
          })

          setHashtags(Array.from(foundHashtags).slice(0, 20))
        }
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setLoading(false)
      }
    }

    if (query.trim()) {
      performSearch()
    }
  }, [query, activeType, currentUserId])

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.push(`/search?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Buscando...</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <Tabs value={activeType} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
              <div className="space-y-2">
                {users.slice(0, 5).map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{user.display_name}</p>
                        <VerificationBadge
                          emailVerified={user.email_verified}
                          officialVerified={user.official_verified}
                          role={user.role}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Posts</h2>
              <div className="divide-y divide-border/40">
                {posts.slice(0, 5).map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                ))}
              </div>
            </div>
          )}

          {hashtags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Hashtags</h2>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag) => (
                  <Link
                    key={hashtag}
                    href={`/hashtag/${hashtag}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{hashtag}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {users.length === 0 && posts.length === 0 && hashtags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron resultados</p>
              <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.display_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{user.display_name}</p>
                      <VerificationBadge
                        emailVerified={user.email_verified}
                        officialVerified={user.official_verified}
                        role={user.role}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron usuarios</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts">
          {posts.length > 0 ? (
            <div className="divide-y divide-border/40">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron posts</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hashtags">
          {hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag) => (
                <Link
                  key={hashtag}
                  href={`/hashtag/${hashtag}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Hash className="h-4 w-4" />
                  <span className="font-medium">{hashtag}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron hashtags</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

