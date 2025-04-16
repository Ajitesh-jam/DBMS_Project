"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUsers from "@/hooks/user.zustand";

import Image from "next/image";
export default function FollowingPage() {
  const [following, setFollowing] = useState([]);
  const user = useUsers((state) => state.selectedUser); 

  const router = useRouter();


  const handleUserSelect = (followingUser) => {

    router.push(`/friendProfile/${followingUser.m?.properties?.name}`); // Navigate to friend profile
  };


  useEffect(() => {
    async function fetchFollowing() {
      try {
        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: user.name }, 
            edgeLabel: "FOLLOWS",
            edgeWhere: {},
            adjNodeLabel: ["USER"],
            adjWhere: {},
          }),
        });

        if (!response.ok) {
          throw new Error("Error fetching following.");
        }

        const data = await response.json();
        console.log("data:", data);
        setFollowing(data || []); 
      } catch (error) {
        console.error("Error loading following list:", error);
      }
    }

    if (user?.name!=="Dummy User") {
      fetchFollowing();
    }
  }, [user]);

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
        </CardHeader>
        <CardContent>
          {following.length === 0 ? (
            <p>You are not following anyone yet.</p>
          ) : (
            following.map((followingUser, index) => (
              <div
                key={followingUser.id || index} // Fallback to index if id is missing
                className="flex justify-between items-center border-b py-2"
              >
                <div className="flex items-center gap-4">
                  {
                      followingUser.n?.properties?.
                      imageURL &&

                  <Image
                      src={follower.n?.properties?.imageURL + `?height=80&width=80`}
                      width={80}
                      height={80}
                      priority={true}

                      alt={follower.n?.properties?.name}
                      className="w-10 h-10 rounded-full"
                  />
                  }
                  <div>
                    <h4 className="text-sm font-medium">
                      {followingUser.m?.properties?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {followingUser.m?.properties?.email}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUserSelect(followingUser)}
                  className="text-blue-500 text-sm"
                >
                  View Profile
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
