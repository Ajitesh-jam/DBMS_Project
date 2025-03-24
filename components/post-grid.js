"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import useUsers from "@/hooks/user.zustand"

export default function PostGrid({ active }) {
  const [posts, setPosts] = useState([])
  const user = useUsers((state) => state.selectedUser)

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
  }, [user]);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          className="relative aspect-square group"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Image 
            src={(post.m?.properties?.imageUrl) || "/placeholder.svg"} 
            alt={`Post ${post.id}`} 
            fill 
            className="object-cover" 
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className="h-5 w-5 fill-white text-white" />
              <span>{post.likes}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
