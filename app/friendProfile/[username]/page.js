"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendHeader from "@/components/friend-header";

import PostGrid from "@/components/post-grid";

;

import useUsers from "@/hooks/user.zustand";
import { use } from "react";






export default function FriendProfilePage({ params }) {
  const { username } = use(params);

  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [Friend , setFriend] = useState({}); // State to hold friend data
  
  const user = useUsers((state) => state.selectedUser);




  useEffect(() => {
    console.log("Friend in FriendProfilePage:", username);


    const decodedUsername = decodeURIComponent(username);
    
    console.log("Decoded username:", decodedUsername);
    

    async function fetchFriend() {
      try {
        const response = await fetch("/api/getNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: decodedUsername },
          }),
        });
        if (!response.ok) {
          throw new Error("Error fetching friend data.");
        }
        const data = await response.json();
        console.log("Friend data:", data);
        if (data.length) {
          const friendData = data[0].n.properties;
          console.log("Friend data properties:", friendData);
          setFriend(friendData);

        }
      } catch (error) {
        console.error("Error loading friend data:", error);
      }
    }


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
        
        if (result.length) {
          console.log("Result is perfect!!");         
          setFollowRequestProps(result.properties);
        }
      } catch (error) {
        console.error("Error checking follow request:", error);
      }
    }
    fetchFriend();
    if (Friend.name) {
      checkFollowRequest();
    }
  }, [username]);

  
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
            isFriendPost: true,
          }));

          setPosts(enhancedPosts);
          
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    if (Friend.name) {
      fetchPosts();
    }
  }, [Friend]);


  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
     
     
      <FriendHeader Friend={Friend} user={user} />

      {/* Tabs for Posts and Reels */}
      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>

        </TabsList>


        <TabsContent value="posts" className="mt-6">
          <PostGrid active={activeTab === "posts"} posts={posts} />
        </TabsContent>

        
      </Tabs>
    </main>
  );
}
