"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, MoreVertical } from "lucide-react"
import PostModal from "@/components/post-modal"

export default function PostGrid({ active, posts }) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)


  const handlePostClick = (post) => {
    setSelectedPost(post)
    setModalOpen(true)
  }


  const handleDeletePost = (
  //  postId
  ) => {
    //const updatedPosts = posts.filter((post) => post.id !== postId)
    setSelectedPost(null)
    setModalOpen(false)
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts &&
        posts
        .filter((post) => {
          const visibility = post.m?.properties?.visibility;
          
    
          // Show:
          // - Own posts (not friend posts) => always show
          // - Friend posts => only show if visibility !== 0
          return visibility !== 0;
        })
        .map((post, index) => (
          <motion.div
            key={post.id}
            className="relative aspect-square group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handlePostClick(post)}
          >
            

            <img
              src={post.m?.properties?.imageURL || "/placeholder.svg"}
              alt={`Post ${post.m?.properties?.name }`}
              className="object-cover w-full h-full"
            />

       
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
              <motion.div
                className="flex items-center gap-1"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className="h-5 w-5 fill-white text-white" />
                {/* <span>{post.likes}</span> */}
              </motion.div>
              <motion.div
                className="flex items-center gap-1"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
              >
                <MessageCircle className="h-5 w-5" />
                {/* <span>{post.comments}</span> */}
              </motion.div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePostClick(post)
              }}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-5 w-5 text-white" />
            </button>
          </motion.div>
        ))
        }
        

      {selectedPost && (
        <PostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={selectedPost}
          onDelete={handleDeletePost}
        />
      )}
    </div>
  )
}
