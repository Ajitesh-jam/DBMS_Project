"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate fetching data
    const fetchPosts = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate 20 random posts
      const generatedPosts = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        image: `/placeholder.svg?height=${300 + Math.floor(Math.random() * 200)}&width=${300 + Math.floor(Math.random() * 200)}`,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 50),
        tags: ["nature", "travel", "photography", "food", "fashion", "art"].sort(() => 0.5 - Math.random()).slice(0, 3),
      }))

      setPosts(generatedPosts)
      setLoading(false)
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) =>
    post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by tags..."
            className="w-full p-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.div
              key={index}
              className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={post.image || "/placeholder.svg"}
                alt={`Post ${post.id}`}
                className="w-full h-full object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="flex items-center text-white mb-2">
                  <span className="mr-4">❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

