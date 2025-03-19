"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, UserCheck } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function UserHeader({ user }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden">
        <Image
          src={user.profileImage || "/placeholder.svg"}
          alt={user.username}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-xl font-bold">{user.username}</h1>
          <div className="flex gap-2">
            <Button variant={isFollowing ? "outline" : "default"} onClick={toggleFollow} className="h-9">
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button variant="outline" className="h-9">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <div className="text-center">
            <span className="font-bold">{user.postsCount}</span>
            <p className="text-sm text-muted-foreground">posts</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{user.followersCount}</span>
            <p className="text-sm text-muted-foreground">followers</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{user.followingCount}</span>
            <p className="text-sm text-muted-foreground">following</p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold">{user.fullName}</h2>
          <p className="text-sm mt-1 whitespace-pre-line">{user.bio}</p>
        </div>
      </div>
    </div>
  )
}

