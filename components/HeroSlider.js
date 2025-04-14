"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, Camera, Heart } from "lucide-react"

const slides = [
  {
    id: 1,
    image: "/bg.svg?height=800&width=1200",
    title: "Share Your Moments",
    description: "Connect with friends and share your favorite memories",
  },
  {
    id: 2,
    image: "/globe.svg?height=800&width=1200",
    title: "Discover Amazing Content",
    description: "Explore trending posts from creators around the world",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=800&width=1200",
    title: "Join Our Community",
    description: "Be part of a growing network of creative individuals",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full overflow-hidden hero-slide">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {slides[currentSlide].description}
          </motion.p>

          <div className="flex justify-center space-x-8">
          <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1, 
                rotate: [0, 10, 0], // Keyframe animation
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                delay: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
            >
              <ThumbsUp className="h-8 w-8" />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1, 
              rotate: [0, -10, 0], 
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              delay: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
          >
            <Camera className="h-8 w-8" />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1, 
              rotate: [0, 10, 0], 
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              delay: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
          >
            <Heart className="h-8 w-8" />
          </motion.div>

          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}

