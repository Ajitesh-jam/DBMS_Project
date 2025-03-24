"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserHeader from "@/components/user-header";
import StoryCircles from "@/components/story-circles";
import PostGrid from "@/components/post-grid";
import ReelGrid from "@/components/reel-grid";

import useUsers from "@/hooks/user.zustand";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");

  const user = useUsers((state) => state.selectedUser);
  const [posts, setPosts] = useState([])

  // Mock user data
  const [userData, setUserData] = useState({
    // username: "johndoe",
    // fullName: "John Doe",
    // profileImage: "/placeholder.svg?height=150&width=150",
    // isFollowing: false,
    // postsCount: 42,
    // followersCount: 1234,
    // followingCount: 567,
    // bio:
    //   "📸 Photography enthusiast | 🌍 Travel lover | 🍕 Food explorer\nwww.johndoe.com",
  });

  useEffect(() => {
    // add attributes like followers:0 ,following ;0, posts:0 to user
    setUserData({
      ...user,
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
            where: { name: user.name, email: user.email },
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

    //setUserData(user);
  }, [user]);



  useEffect(() => {

  }, [user]);

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
      <UserHeader user={userData} />
      <StoryCircles stories={stories} />

      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <PostGrid active={activeTab === "posts"} posts={posts} />
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
          <ReelGrid active={activeTab === "reels"} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
