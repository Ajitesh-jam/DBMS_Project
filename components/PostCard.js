"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useAnimation } from "framer-motion"
import { Heart, MessageCircle, Bookmark } from "lucide-react"
import useUsers from "@/hooks/user.zustand";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const user = useUsers((state) => state.selectedUser);

  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState( [])
  const [numberOfComments, setNumberOfComments] = useState(0);
  const [numberOfLikes, setNumberOfLikes] = useState(0);

  let postFetched = false;


  const controls = useAnimation()
  const cardRef = useRef(null)

  const handleLike = () => {
    if (liked) {

      setNumberOfLikes(numberOfLikes-1 )


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
            endNodeWhere: { name: post.name, postedBy: post.postedBy },
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

      setNumberOfLikes(numberOfLikes + 1)
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
            endNodeWhere: { name: post?.name, postedBy: post?.postedBy },
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
            endNodeWhere: { name: post.name, postedBy: post.postedBy },
            edgeLabel: "COMMENT",
            properties: {
              comment: comment,
              postedBy: user.name,
              postedTo: post.postedBy,
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

    if(postFetched) return;
    postFetched = true;

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
      adjWhere: { name: post.name, postedBy: post.postedBy },
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
      
    fetch("/api/checkEdge", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
      label: "USER",
      where: { name: user.name },
      adjNodeLabel: "POST",
      adjWhere: { name: post.name, postedBy: post.postedBy },
      edgeLabel: "SAVED",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
      console.log("Edge exists for post :", data, post);
      setSaved(data.edgeExists);
      })
      .catch((error) => {
      console.error("Error checking edge existence:", error);
      });
      
      
      fetch("/api/getEdgesToNode", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        label: "POST",
        where: { postedBy: post.postedBy , name : post.name },
        edgeLabel: "COMMENT",
        edgeWhere:{} ,     
        adjNodeLabel: "USER",
        adjWhere: {}
        }),
      })
        .then((response) => response.json())
        .then((data) => {

        
          console.log("comments ", data);
          data.map((comment) => {
            console.log("comment", comment);
            setNumberOfComments((prevCount) => prevCount + 1);
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

        fetch("/api/getEdgesToNode", {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
          label: "POST",
          where: { postedBy: post.postedBy , name : post.name },
          edgeLabel: "LIKED",
          edgeWhere:{} ,     
          adjNodeLabel: "USER",
          adjWhere: {}
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            // set likes as data.size

           
            setNumberOfLikes(data.length);
            
          })
          .catch((error) => {
          console.error("Error checking edge existence:", error);
          });
  },[]);

  async function savePost() {
    console.log("Saving post...")
    if (saved) {

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
            endNodeWhere: { name: post?.name, postedBy: post?.postedBy },
            edgeLabel: "SAVED",
            properties: {},
          }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("saves updated successfully:", data)
      })
      .catch((error) => {
        console.error("Error updating saves:", error)
      })

      
    } 
    else {


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
            endNodeWhere: { name: post?.name, postedBy: post?.postedBy },
            edgeLabel: "SAVED",
            properties: {},
          }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("saves updated successfully:", data)
      })
      .catch((error) => {
        console.error("Error updating saves:", error)
      })

    }  
    setSaved(!saved)  
  }

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
          src={user.imageURL || "/placeholder.svg"}
          alt = "/placeholder.svg"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <Link href={`/friendProfile/${post?.postedBy}`} className="font-medium hover:underline ">
            {post?.postedBy}
          </Link>
        </div>
        
      </div>

      <div className="relative aspect-square">
        <Image
          src={post?.imageURL || "/placeholder.svg"}
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
          <span className="ml-1">{numberOfLikes}</span>


          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-2">
            <MessageCircle className="h-6 w-6" />
          </button>
          <span className="ml-1">{numberOfComments}</span>

         

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ml-auto">
            <Bookmark className={`h-6 w-6 ${saved ? "fill-current" : ""}`} onClick={savePost}  />
          </button>
        </div>

        <div>
          <p className="mb-2">
            <Link href={`/profile/${post?.properties?.name}`} className="font-medium hover:underline">
              {post?.properties?.name}
            </Link>{" "}
            {}
          </p>
          <p className="text-gray-500 text-sm">{}</p>
        </div>

        <span> {post?.postedBy} :  {post?.description} </span>


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

