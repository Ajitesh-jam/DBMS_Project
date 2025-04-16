"use client"

import { useState } from "react"
import { X, Trash, Info, Edit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import useUsers from "@/hooks/user.zustand"
import { useRouter } from "next/navigation"

export default function PostModal({ open, onClose, post }) {
  const user = useUsers((state) => state.selectedUser)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      console.log("Deleting post with ID:", post.id)
      const response = await fetch("/api/deleteAdjacentNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: user.name },
          endNodeLabel: ["POST"],
          endNodeWhere: { name: post.m?.properties?.name },
          edgeLabel: "POSTED_BY",
        }),
      })

      if (!response.ok) {
        throw new Error("Error deleting post!")
      }

      console.log("Post deleted successfully:", response)

      const decrementPostsResponse = await fetch("/api/updateNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          where: { name: user.name, email: user.email },
          updates: {
            posts: user.posts - 1,
          },
        }),
      })

      if (!decrementPostsResponse.ok) {
        throw new Error("Error updating user posts count!")
      }

      const updatedUser = await decrementPostsResponse.json()
      console.log("Updated user posts count:", updatedUser)

      useUsers.setState((state) => ({
        selectedUser: {
          ...state.selectedUser,
          posts: updatedUser.data.posts,
        },
      }))

      console.log("Updated Zustand state with new user data:", updatedUser.data.posts)
      onClose()
      console.log("Modal closed after delete.")
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    const query = new URLSearchParams({ postName: post.m?.properties.name }).toString()
    console.log("Query:", post.m?.properties.name)
    router.push(`/editPost?${query}`)
  }

  const handleDetails = () => {
    alert("Details feature coming soon!")
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        delay: 0.1,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

            {/* Image container */}
            <div className="relative bg-black flex items-center justify-center">
              <motion.img
                src={post.m?.properties?.imageURL || "/placeholder.svg"}
                alt={`Post ${post.id}`}
                className="w-full max-h-[50vh] object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>

            {/* Description */}
            <motion.div
              className="p-6 bg-white dark:bg-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <p className="text-gray-700 dark:text-gray-200 text-center text-lg">
                {post.m?.properties?.description || "No description available."}
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <motion.button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </motion.button>

              <motion.button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4" />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </motion.button>

              <motion.button
                onClick={handleDetails}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Info className="h-4 w-4" />
                <span>Details</span>
              </motion.button>

              <motion.button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </motion.button>
            </motion.div>

            {/* Close button in top-right corner */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-white/30 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
