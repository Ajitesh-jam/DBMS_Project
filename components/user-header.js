"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import Router from "next/router";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUser from "@/hooks/user.zustand"

export default function UserHeader({ user }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const logout = useUser((state) => state.removeUser)
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  useEffect(() => {
    console.log("User in header: ", user);
  }, [user]);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      // Delete user node
      const response = await fetch("/api/deleteNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: "USER",
          where: { name: user.name, email: user.email },
        }),
      });
  
      if (!response.ok) {
        console.error("Failed to delete user node");
        return;
      }
  
      // Delete user's posts
      const adjacentResponse = await fetch("/api/deleteAdjacentNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: "USER",
          startNodeWhere: { name: user.name, email: user.email },
          endNodeLabel: "POST",
          endNodeWhere: {},
          edgeLabel: "POSTED_BY",
        }),
      });
  
      if (!adjacentResponse.ok) {
        console.error("Failed to delete adjacent posts");
        return;
      }
  
      console.log("Account and posts deleted successfully");
      logout(); // remove user from zustand
      router.push("/"); // redirect to homepage or login
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  }
  


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

              onClick={() => { router.push("/editProfile") }} // Navigate to Edit Profile
              className="h-9"
            >
              {
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              }
            </Button>
            <Button

              onClick={handleDeleteAccount}
              className="h-9 flex items-center justify-center "
            >
              {<>
                <div className="h-4 w-4" /> {/* Placeholder/icon size */}
                <span>Delete my Account</span>
              </>}
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
};
