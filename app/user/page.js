"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserHeader from "@/components/user-header"
import StoryCircles from "@/components/story-circles"
import PostGrid from "@/components/post-grid"
import ReelGrid from "@/components/reel-grid"

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")

  // Mock user data
  const userData = {
    username: "johndoe",
    fullName: "John Doe",
    profileImage: "/placeholder.svg?height=150&width=150",
    isFollowing: false,
    postsCount: 42,
    followersCount: 1234,
    followingCount: 567,
    bio: "📸 Photography enthusiast | 🌍 Travel lover | 🍕 Food explorer\nwww.johndoe.com",
  }

  // Mock stories data
  const stories = [
    { id: 1, image: "/placeholder.svg?height=80&width=80", title: "Travel" },
    { id: 2, image: "/placeholder.svg?height=80&width=80", title: "Food" },
    { id: 3, image: "/placeholder.svg?height=80&width=80", title: "Pets" },
    { id: 4, image: "/placeholder.svg?height=80&width=80", title: "Nature" },
    { id: 5, image: "/placeholder.svg?height=80&width=80", title: "Music" },
  ]

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <UserHeader user={userData} />
      <StoryCircles stories={stories} />

      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <PostGrid active={activeTab === "posts"} />
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
          <ReelGrid active={activeTab === "reels"} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

