"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, PlusSquare, Compass, Heart, User, X } from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/post", icon: PlusSquare, label: "Create Post" },
    { href: "/notifications", icon: Heart, label: "Notifications" },

    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <div style={{ border: "1px solid cyan", borderRadius: "8px" }}>
      <motion.button
        className="fixed left-4 top-20 z-40 md:hidden bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-lg md:relative md:translate-x-0 md:shadow-none md:w-20 lg:w-64"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div className="p-4 flex justify-between items-center md:hidden">
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
            Snapgram
          </span>
          <motion.button onClick={() => setIsOpen(false)} whileTap={{ scale: 0.9 }}>
            <X className="h-6 w-6" />
          </motion.button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  <motion.div
                    className="flex items-center p-3 rounded-md sidebar-link hover:bg-gray-100 dark:hover:bg-gray-800"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <link.icon className="h-6 w-6 mr-3 md:mr-0 lg:mr-3" />
                    <span className="md:hidden lg:inline">{link.label}</span>
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:block w-20 lg:w-64 shrink-0"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="sticky top-20 mt-8 px-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>
                  <motion.div
                    className="flex items-center p-3 rounded-md sidebar-link hover:bg-gray-100 dark:hover:bg-gray-800"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <link.icon className="h-6 w-6 mr-3 md:mr-0 lg:mr-3" />
                    <span className="hidden lg:inline">{link.label}</span>
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.aside>
    </div>
  )
}

function Menu(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

