"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useAnimation } from "framer-motion"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import useUsers from "@/hooks/user.zustand";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const user = useUsers((state) => state.selectedUser);
  const [likes, setLikes] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState(post.comments || [])
  const controls = useAnimation()
  const cardRef = useRef(null)

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1)


      fetch("/api/deleteEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          JSON.stringify({
            startNodeLabel: "USER",
            startNodeWhere: { name: user.name },
            endNodeLabel: "POST",
            endNodeWhere: { name: post.adj?.properties?.name, postedBy: post.adj?.properties?.postedBy },
            edgeLabel: "LIKED",
            properties: {},
          }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Likes updated successfully:", data)
      })
      .catch((error) => {
        console.error("Error updating likes:", error)
      })

      
    } 
    else {
      setLikes(likes + 1)
      controls.start({
        scale: [1, 12, 1],
        transition: { duration: 0.3 },
      })


      fetch("/api/createEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          JSON.stringify({
            startNodeLabel: ["USER"],
            startNodeWhere: { name: user.name },
            endNodeLabel: ["POST"],
            endNodeWhere: { name: post.adj?.properties?.name, postedBy: post.adj?.properties?.postedBy },
            edgeLabel: "LIKED",
            properties: {},
          }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Likes updated successfully:", data)
      })
      .catch((error) => {
        console.error("Error updating likes:", error)
      })

    }  
    setLiked(!liked)   
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      setComments([...comments, { user: user.name, text: comment }])
      setComment("")

      fetch("/api/createEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          JSON.stringify({
            startNodeLabel: ["USER"],
            startNodeWhere: { name: user.name },
            endNodeLabel: ["POST"],
            endNodeWhere: { name: post.adj?.properties?.name, postedBy: post.adj?.properties?.postedBy },
            edgeLabel: "COMMENT",
            properties: {
              comment: comment,
              postedBy: user.name,
              postedTo: post.adj?.properties?.postedBy,
              postedAt: new Date().toISOString(),

            },
          }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("comment updated successfully:", data)
      })
      .catch((error) => {
        console.error("Error updating comement:", error)
      })
    }
  }

  useEffect(() => {

    console.log("Post card : ", post);
    //fetch if the post is liked 
    fetch("/api/checkEdge", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
      label: "USER",
      where: { name: user.name },
      adjNodeLabel: "POST",
      adjWhere: { name: post.adj?.properties?.name, postedBy: post.adj?.properties?.postedBy },
      edgeLabel: "LIKED",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
      console.log("Edge exists for post :", data, post);
      setLiked(data.edgeExists);
      })
      .catch((error) => {
      console.error("Error checking edge existence:", error);
      });
      
      
      fetch("/api/getEdgesOfNodeByLabel", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        label: "USER",
        where: { name: user.name },
        edgeLabel: "COMMENT",
        edgeWhere:{postedBy: post.adj?.properties?.postedBy}      // YEH KAAM NHI KARA HAI----------------------------------------------------------------------------------------------------------------------------------

        }),
      })
        .then((response) => response.json())
        .then((data) => {

          console.log("Comment by :", data, post);
          data.forEach((comment) => {
            console.log("comment", comment);
            
              setComments((prevComments) => [
                ...prevComments,
                { user: comment.e.properties?.postedBy, text: comment.e.properties?.comment },
              ]);
          }
          );
        })
        .catch((error) => {
        console.error("Error checking edge existence:", error);
        });
  },[]);

  return (
    <motion.div
      ref={cardRef}
      className="bg-black dark:bg-red-900 rounded-lg shadow-md overflow-hidden"
      whileHover={{
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(47, 30, 201, 0.1), 0 10px 10px -5px rgba(15, 27, 158, 0.04)",
      }}
      transition={{ duration: 0.2 }}

      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}

      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      style={{ border: "1px solid cyan", borderRadius: "8px" }}
    >
      <div className="p-4 flex items-center">
        <Image
          src={user.imageUrl || "/placeholder.svg"}
          alt = "/placeholder.svg"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <Link href={`/friendProfile/${post.adj?.properties?.postedBy}`} className="font-medium hover:underline ">
            {post.adj?.properties?.postedBy}
          </Link>
        </div>
        <button className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="relative aspect-square">
        <Image
          src={post.adj?.properties?.imageUrl || "/placeholder.svg"}
          alt = "/placeholder.svg"
          fill
          style={{ objectFit: "cover" }}
          onClick={() => setShowComments(!showComments)}
          className="cursor-pointer"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4">
          <motion.button
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 like-button ${liked ? "active" : ""}`}
            onClick={handleLike}
            animate={controls}
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
          </motion.button>


          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2">
            <MessageCircle className="h-6 w-6" />
          </button>
          <span className="ml-1">{}</span>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2">
            <Send className="h-6 w-6" />
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-auto">
            <Bookmark className="h-6 w-6" />
          </button>
        </div>

        <div>
          <p className="mb-2">
            <Link href={`/profile/${post.properties?.name}`} className="font-medium hover:underline">
              {post.properties?.name}
            </Link>{" "}
            {}
          </p>
          <p className="text-gray-500 text-sm">{}</p>
        </div>

        <AnimatePresence>
          {showComments && (


            <>
            
            <motion.div
              className="mt-4 border-t pt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-medium mb-2">Comments</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {comments.map((comment, index) => (
                  <div key={index} className="flex">
                    <span className="font-medium mr-2">{comment.user}</span>
                    <span>{comment.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:border-gray-700"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 rounded-r-md"
                >
                  Post
                </button>
              </form>
            </motion.div>

            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function AnimatePresence({ children }) {
  return children
}

