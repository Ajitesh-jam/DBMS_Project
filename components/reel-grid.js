"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Play } from "lucide-react"
import { motion } from "framer-motion"

export default function ReelGrid({ active }) {
  const [reels, setReels] = useState([])

  useEffect(() => {
    // Mock reels data
    const mockReels = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      image: `/placeholder.svg?height=600&width=400&text=Reel+${i + 1}`,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      views: Math.floor(Math.random() * 50000),
    }))

    setReels(mockReels)
  }, [])

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {reels.map((reel, index) => (
        <motion.div
          key={reel.id}
          className="relative aspect-[9/16] group"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Image src={reel.image || "/placeholder.svg"} alt={`Reel ${reel.id}`} fill className="object-cover" />
          <div className="absolute bottom-2 right-2">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className="h-5 w-5 fill-white text-white" />
              <span>{reel.likes}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{reel.comments}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

