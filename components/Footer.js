"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Instagram, Twitter, Facebook, Youtube, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.footer
      className="bg-white-100 dark:bg-white-900 py-12  boarder-t border-cyan-200 dark:border-cyan-800" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={footerVariants}
      style={{ border: "1px solid cyan", borderRadius: "8px" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Snapgram</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your moments with the world. Connect with friends and discover amazing content.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#E1306C" }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Instagram />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#1DA1F2" }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Twitter />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#4267B2" }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Facebook />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3, color: "#FF0000" }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Youtube />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Safety Center
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Subscribe to our newsletter for updates</p>
            <div className="flex">
              {/* <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800"
              /> */}
              <Input></Input>
              <button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-r-md">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          <p>&copy; {new Date().getFullYear()} Snapgram. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  )
}

