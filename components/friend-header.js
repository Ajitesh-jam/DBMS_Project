"use client";
import { Loader2, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import useUsers from "@/hooks/user.zustand";

export default function FriendHeader({ Friend, activeUserId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const user = useUsers((state) => state.selectedUser);

  // Function to persist follow state to localStorage
  const saveFollowState = (friendId, value) => {
    localStorage.setItem(`follow_${friendId}`, JSON.stringify(value));
  };

  // Function to retrieve follow state from localStorage
  const getFollowState = (friendId) => {
    const savedState = localStorage.getItem(`follow_${friendId}`);
    return savedState ? JSON.parse(savedState) : false;
  };

  // ✅ API call to create FOLLOW_REQUESTED edge
  const createFollowRequest = async () => {
    try {
      setIsRequesting(true);
      console.log("Active User ID:", activeUserId);
      console.log("Friend ID:", Friend.id);

      const response = await fetch("/api/createEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"], // Active user sending the request
          startNodeWhere: { name: user.name }, // Active user's name
          endNodeLabel: ["USER"], // User receiving the request
          endNodeWhere: { name: Friend.name },
          edgeLabel: "FOLLOW_REQUESTED",
          properties: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Follow request sent successfully:", data);

      // Mark as following and persist to localStorage
      setIsFollowing(true);
      saveFollowState(Friend.id, true);
    } catch (err) {
      console.error("Error sending follow request:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  // ❌ API call to delete FOLLOW_REQUESTED edge
  const deleteFollowRequest = async () => {
    try {
      setIsRequesting(true);
      console.log("Deleting Follow Request...");
      console.log("Active User ID:", activeUserId);
      console.log("Friend ID:", Friend.id);

      const response = await fetch("/api/deleteEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"], // Active user sending the request
          startNodeWhere: { name: user.name }, // Active user's name
          endNodeLabel: ["USER"], // User receiving the request
          endNodeWhere: { name: Friend.name },
          edgeLabel: "FOLLOW_REQUESTED",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Follow request deleted successfully:", data);

      // Unfollow and update localStorage
      setIsFollowing(false);
      saveFollowState(Friend.id, false);
    } catch (err) {
      console.error("Error deleting follow request:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  // 🔄 Toggle follow/unfollow logic
  const toggleFollow = () => {
    if (!isFollowing) {
      createFollowRequest(); // Send follow request
    } else {
      deleteFollowRequest(); // Unfollow and delete edge
    }
  };

  // Load follow state from localStorage on component mount
  useEffect(() => {
    const initialFollowState = getFollowState(Friend.id);
    setIsFollowing(initialFollowState);
    console.log("Friend in header:", Friend);
  }, [Friend.id]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Profile Picture */}
      <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden">
        <img
          src={Friend.imageUrl || "/placeholder.svg"}
          alt={Friend.name}
          className="object-cover"
        />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-xl font-bold">{Friend.name}</h1>
          <div className="flex gap-2">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={toggleFollow}
              className="h-9"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>

            <Button variant="outline" className="h-9">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <div className="text-center">
            <span className="font-bold">{Friend.posts}</span>
            <p className="text-sm text-muted-foreground">posts</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{Friend.followers}</span>
            <p className="text-sm text-muted-foreground">followers</p>
          </div>
          <div className="text-center">
            <span className="font-bold">{Friend.following}</span>
            <p className="text-sm text-muted-foreground">following</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          <h2 className="font-semibold">{Friend.name}</h2>
          <p className="text-sm mt-1 whitespace-pre-line">{Friend.bio}</p>
        </div>
      </div>
    </div>
  );
}
