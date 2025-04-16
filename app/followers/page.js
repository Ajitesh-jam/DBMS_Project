"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUsers from "@/hooks/user.zustand";
import Image from "next/image";

export default function FollowersPage() {
    const [followers, setFollowers] = useState([]);
    const user = useUsers((state) => state.selectedUser);
    const router = useRouter();
    const handleUserSelect = (name) => {
        router.push(`/friendProfile/${name}`) // Navigate with query param
      }

    useEffect(() => {
        async function fetchFollowers() {
            try {
                const response = await fetch("/api/getStartAdjNodeByLabel", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        label: ["USER"],
                        where: {},
                        edgeLabel: "FOLLOWS",
                        edgeWhere: {},
                        adjNodeLabel: ["USER"],
                        adjWhere: { name: user.name },
                    }),
                });

                if (!response.ok) {
                    throw new Error("Error fetching followers.");
                }

                const data = await response.json();
                console.log("data:", data);
                setFollowers(data || []);
            } catch (error) {
                console.error("Error loading followers:", error);
            }
        }

        if (user?.name!=="Dummy User") {
            fetchFollowers();
        }
    }, [user]);

    return (
        <main className="container max-w-2xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Followers</CardTitle>
                </CardHeader>
                <CardContent>
                    {followers.length === 0 ? (
                        <p>No followers yet.</p>
                    ) : (
                        followers.map((follower, index) => (
                            <div
                                key={follower.id || index} // Fallback to index if id is missing
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div className="flex items-center gap-4">
                                    {
                                        follower.n?.properties?.
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
                                            {follower.n?.properties?.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {follower.n?.properties?.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleUserSelect(follower.n?.properties?.name)}
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
