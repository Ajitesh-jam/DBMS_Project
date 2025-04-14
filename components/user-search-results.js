"use client"

import { useState } from "react"

import { Loader2, UserIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function UserSearchResults({ results, isLoading, searchTerm, onUserSelect }) {
  const [hoveredUser, setHoveredUser] = useState(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Searching...</span>
      </div>
    )
  }

  if (!searchTerm) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg">Enter a username to search</p>
      </div>
    )
  }

  if (results.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No users found matching with {searchTerm} </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium mb-4">Search Results</h2>

      <AnimatePresence>
        {results.map((user, index) => (
          <motion.div
            key={user.id || `user-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${hoveredUser === user.id ? "bg-accent" : "hover:bg-muted"
              }`}
            onClick={() => onUserSelect(user.id)}
            onMouseEnter={() => setHoveredUser(user.id)}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
              <img src={user.profileImage || "/placeholder.svg"} alt={user.username}
                //fill
                className="object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-sm text-muted-foreground">{user.fullName}</p>
                </div>
                <div className="text-sm text-muted-foreground mt-1 sm:mt-0">
                  {/* Safely handle followers count */}
                  {user.followers?.toLocaleString() || "0"} followers
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

