"use client";

import { useState, useEffect,useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserHeader from "@/components/user-header";
import StoryCircles from "@/components/story-circles";
import PostGrid from "@/components/post-grid";

import PostModal from "@/components/post-modal";
import useUsers from "@/hooks/user.zustand";
import { motion ,useAnimation,useInView } from "framer-motion";
import PostCard from "@/components/PostCard";



export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const controls = useAnimation();

  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.1 });

  const user = useUsers((state) => state.selectedUser);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });


  useEffect(() => {
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
            where: { name: user.name },
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


        if (Array.isArray(fetchedPosts)) {
          const enhancedPosts = fetchedPosts.map((post) => ({
            ...post,
            id: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
          }));

          setPosts(enhancedPosts);

          // Update post count dynamically in FriendData
          setUserData((prev) => ({
            ...prev,
            posts: enhancedPosts.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    setUserData({
      ...user,
      followers: user.followers || 0,
      following: user.following || 0,
      posts: 0,
    });

    if (user.name) {
      fetchPosts();
    }
  }, [user]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };


  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };


  const stories = [
    { id: 1, image: "/placeholder.svg?height=80&width=80", title: "Travel" },
    { id: 2, image: "/placeholder.svg?height=80&width=80", title: "Food" },
    { id: 3, image: "/placeholder.svg?height=80&width=80", title: "Pets" },
    { id: 4, image: "/placeholder.svg?height=80&width=80", title: "Nature" },
    { id: 5, image: "/placeholder.svg?height=80&width=80", title: "Music" },
  ];

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);


  useEffect(() => {
    async function fetchFriendPosts() {
      try {

        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: "USER",
            where: { name: user.name },
            edgeLabel: "SAVED",
            edgeWhere: {},
            adjNodeLabel: "POST",
            adjWhere: {},
        
          }),
        });
        if (!response.ok) {
          throw new Error("Error fetching friends posts.");
        }
        const data = await response.json();
        setSavedPosts(data || []);
        } catch (error) {
        console.error("Error loading followers:", error);
      }
    }

    if (user?.name!=="Dummy User") { 
      fetchFriendPosts();
    }

  
  }, [user]);

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <UserHeader user={userData} />
      <StoryCircles stories={stories} />

      {selectedPost && (
        <PostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={selectedPost}
          onDelete={handleDeletePost}
        />
      )}

      <Tabs defaultValue="posts" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reels">Saved Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">

          <PostGrid active={activeTab === "posts"} posts={posts} onPostClick={handlePostClick} />
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
          {/* <ReelGrid active={activeTab === "reels"} /> */}


          {activeTab === "reels" && (
            
            <div ref={ref} className="space-y-200 z -4">

                {savedPosts.map((savedPost, index) => (


                  <motion.div
                    key={index}
                    
                  >

                    {savedPosts.m?.properties?.name}
                    <PostCard post={savedPost.m.properties} />
                    <br></br>
                    <br></br>

                  </motion.div>
                ))}
          </div>
          
          )
          }
        </TabsContent>
      </Tabs>
    </main>
  );
}
