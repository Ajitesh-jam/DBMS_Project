"use client";

import { Button } from "@/components/ui/button";
import {  UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function UserHeader({ user }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  useEffect(() => {
    console.log("User in header: ", user);
  }, [user]);
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden">
        <img
          src={user.imageUrl || "/placeholder.svg"}
          alt={user.name}
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <div className="flex gap-2">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={toggleFollow}
              className="h-9"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
            
          </div>
        </div>

        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <div className="text-center">
            <span className="font-bold">{user.posts}</span>
            <p className="text-sm text-muted-foreground">posts</p>
          </div>
          <div
            className="text-center cursor-pointer"
            onClick={() => router.push(`/followers`)}
          >
            <span className="font-bold">{user.followers}</span>
            <p className="text-sm text-muted-foreground">followers</p>
          </div>

          <div
            className="text-center cursor-pointer"
            onClick={() => router.push(`/following`)}
          >
            <span className="font-bold">{user.following}</span>
            <p className="text-sm text-muted-foreground">following</p>
          </div>

        </div>

        <div className="mt-4">
          <h2 className="font-semibold">{user.name}</h2>
          <p className="text-sm mt-1 whitespace-pre-line">{user.bio}</p>
        </div>
      </div>
    </div>
  );
}
