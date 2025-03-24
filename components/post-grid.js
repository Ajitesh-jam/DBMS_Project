"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import useUsers from "@/hooks/user.zustand"

export default function PostGrid({ active,posts }) {
  //const [posts, setPosts] = useState([])


  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts && posts.map((post, index) => (
        <motion.div
          key={post.id}
          className="relative aspect-square group"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <img 
            src={(post.m?.properties?.imageUrl) || "/placeholder.svg"} 
            alt={`Post ${post.id}`} 
            //fill={true} 
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
