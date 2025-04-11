"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendHeader from "@/components/friend-header";
import StoryCircles from "@/components/story-circles";
import PostGrid from "@/components/post-grid";
import ReelGrid from "@/components/reel-grid";
import useFriends from "@/hooks/friend.zustand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import useUsers from "@/hooks/user.zustand";

export default function FriendProfilePage({ activeUserId }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const Friend = useFriends((state) => state.selectedFriend);
  const user = useUsers((state) => state.selectedUser);

  const [FriendData, setFriendData] = useState({
    ...Friend,
    followers: 0,
    following: 0,
    posts: 0,
  });


  useEffect(() => {
    async function checkFollowRequest() {
      try {
        const response = await fetch("/api/getStartAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: Friend.name },
            edgeLabel: "FOLLOW_REQUESTED",
            edgeWhere: {},// Friend being viewed
            adjNodeLabel: ["USER"],
            adjWhere: { name: user.name } // Active user logged in
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("result for response", result);
        // console.log("result.properties:",result.properties);
        // console.log("result.exists:",result.exists);
        if (result.length) {
          console.log("Result is perfect!!");


          setShowPopup(true);
          setFollowRequestProps(result.properties);
        }
      } catch (error) {
        console.error("Error checking follow request:", error);
      }
    }

    if (Friend.name) {
      checkFollowRequest();
    }
  }, [Friend.name, activeUserId]);

  
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: Friend.name },
            edgeLabel: "POSTED_BY",
            edgeWhere: {},
            adjNodeLabel: "POST",
            adjWhere: {},
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedPosts = await response.json();
        console.log("Posts Response:", fetchedPosts);

        if (Array.isArray(fetchedPosts)) {
          const enhancedPosts = fetchedPosts.map((post) => ({
            ...post,
            id: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
          }));

          setPosts(enhancedPosts);

          // Update post count dynamically in FriendData
          setFriendData((prev) => ({
            ...prev,
            posts: enhancedPosts.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    setFriendData({
      ...Friend,
      followers: Friend.followers || 0,
      following: Friend.following || 0,
      posts: 0,
    });

    if (Friend.name) {
      fetchPosts();
    }
  }, [Friend]);

  // ✅ Mock stories data
  const stories = [
    { id: 1, image: "/placeholder.svg?height=80&width=80", title: "Travel" },
    { id: 2, image: "/placeholder.svg?height=80&width=80", title: "Food" },
    { id: 3, image: "/placeholder.svg?height=80&width=80", title: "Pets" },
    { id: 4, image: "/placeholder.svg?height=80&width=80", title: "Nature" },
    { id: 5, image: "/placeholder.svg?height=80&width=80", title: "Music" },
  ];

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
     
     
      <FriendHeader Friend={Friend} user={user} />

      {/* Tabs for Posts and Reels */}
      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          <PostGrid active={activeTab === "posts"} posts={posts} />
        </TabsContent>

        {/* Reels Tab */}
        <TabsContent value="reels" className="mt-6">
          <ReelGrid active={activeTab === "reels"} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
