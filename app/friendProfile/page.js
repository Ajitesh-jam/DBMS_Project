"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendHeader from "@/components/friend-header";
import StoryCircles from "@/components/story-circles";
import PostGrid from "@/components/post-grid";
import ReelGrid from "@/components/reel-grid";

import useFriends from "@/hooks/friend.zustand";

export default function FriendProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
    const [posts, setPosts] = useState([])

  const Friend = useFriends((state) => state.selectedFriend);

  // Mock Friend data
  const [FriendData, setFriendData] = useState({

  });

  useEffect(() => {
    // add attributes like followers:0 ,following ;0, posts:0 to Friend
    setFriendData({
      ...Friend,
      followers: 0,
      following: 0,
      posts: 0,
    });

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
  
          const posts = await response.json();
          console.log("Posts Response:", posts);
  
          if (Array.isArray(posts)) {
            posts.forEach((post) => {
              post.id = Math.floor(Math.random() * 1000);
              post.likes = Math.floor(Math.random() * 1000);
              post.comments = Math.floor(Math.random() * 100);
            });
  
            console.log("Posts with Added Fields:", posts);
            setPosts(posts);
          } else {
            console.error("Posts is not an array:", posts);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
  
      fetchPosts();

    //setFriendData(Friend);
  }, [Friend]);

  // Mock stories data
  const stories = [
    { id: 1, image: "/placeholder.svg?height=80&width=80", title: "Travel" },
    { id: 2, image: "/placeholder.svg?height=80&width=80", title: "Food" },
    { id: 3, image: "/placeholder.svg?height=80&width=80", title: "Pets" },
    { id: 4, image: "/placeholder.svg?height=80&width=80", title: "Nature" },
    { id: 5, image: "/placeholder.svg?height=80&width=80", title: "Music" },
  ];

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <FriendHeader Friend={FriendData} />
      <StoryCircles stories={stories} />

      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <PostGrid active={activeTab === "posts"} posts ={posts} />
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
          <ReelGrid active={activeTab === "reels"} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
