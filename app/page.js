"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import HeroSlider from "@/components/HeroSlider"
import PostCard from "@/components/PostCard"

const posts = [
  {
    id: 1,
    user: {
      name: "Jessica Parker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=600&width=800",
    likes: 234,
    caption: "Enjoying the beautiful sunset at the beach! 🌅 #sunset #beach #vibes",
    comments: [
      { user: "mike_smith", text: "Looks amazing! 😍" },
      { user: "travel_lover", text: "I need to visit this place!" },
    ],
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=600&width=800",
    likes: 156,
    caption: "Just finished my morning hike! The view was worth every step 🏔️ #hiking #nature #adventure",
    comments: [
      { user: "nature_enthusiast", text: "This view is breathtaking!" },
      { user: "hiker101", text: "Which trail is this?" },
    ],
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=600&width=800",
    likes: 342,
    caption: "Coffee and a good book - perfect Sunday morning ☕📚 #coffeetime #bookworm #relaxing",
    comments: [
      { user: "book_lover", text: "What are you reading?" },
      { user: "coffee_addict", text: "That coffee looks delicious!" },
    ],
    timestamp: "7 hours ago",
  },
  {
    id: 4,
    user: {
      name: "David Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    image: "/placeholder.svg?height=600&width=800",
    likes: 189,
    caption: "Just got my new camera! Can't wait to capture some amazing shots 📸 #photography #newgear #excited",
    comments: [
      { user: "photo_enthusiast", text: "Which model did you get?" },
      { user: "camera_pro", text: "You're going to love it!" },
    ],
    timestamp: "1 day ago",
  },
]

export default function Home() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, amount: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <div className="w-full">
      <HeroSlider />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Latest Posts
        </motion.h2>

        <div ref={ref} className="space-y-12">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.2,
                  },
                },
              }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

