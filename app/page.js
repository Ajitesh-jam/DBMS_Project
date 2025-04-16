"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import PostCard from "@/components/PostCard";
import useUsers from "@/hooks/user.zustand";


export default function Home() {
  const controls = useAnimation();
  const user = useUsers((state) => state.selectedUser);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.1 });

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);


  useEffect(() => {
    async function fetchFriendPosts() {
      try {

        const response = await fetch("/api/getAdjNodesofAdjNode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: user.name },
            edgeLabel: "FOLLOWS",
            edgeWhere: {},
            adjNodeLabel: ["USER"],
            adjWhere: {},
            AdjNodesofAdjNodeLabel: ["POST"],
            AdjNodesofAdjNodeEdgeLabel: "POSTED_BY",
            AdjNodesofAdjNodeEdgeWhere: {},
          }),
        });
        if (!response.ok) {
          throw new Error("Error fetching friends posts.");
        }
        console.log("response:", response);
        const data = await response.json();
        console.log("data:", data);
        setPosts(data || []);
      } catch (error) {
        console.error("Error loading followers:", error);
    }
    }
    
      fetchFriendPosts();
  
  }, [user]);
  

return (
  <div className="w-full">
    <HeroSlider />


    <section className="max-w-4xl mx-auto px-4 py-12">
      <motion.h2
        className="text-3xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Friend s Posts
      </motion.h2>

      <div ref={ref} className="space-y-12">
        {posts.map((post, index) => (
          <motion.div
            key={index}
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
            {post.adj?.properties && (
              
              <PostCard post={post.adj?.properties} />
            )}
            
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);
}
