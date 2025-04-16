"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { X, MoreVertical, Trash, Info, Edit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import useUsers from "@/hooks/user.zustand";



import { useRouter } from "next/navigation"
export default function PostModal({ open, onClose, post, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);
  const user = useUsers((state) => state.selectedUser);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    try {
      setIsDeleting(true); // Indicate deletion in progress
      console.log("Deleting post with ID:", post.id); // Debug log
      const response = await fetch("/api/deleteAdjacentNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: user.name }, // User's email or identifier
          endNodeLabel: ["POST"],
          endNodeWhere: { name: post.m?.properties?.name },
          edgeLabel: "POSTED_BY",
        }),
      });

      if (!response.ok) {
        throw new Error("Error deleting post!");
      }

      
      console.log("Post deleted successfully:", response);

      //change the user node to decrease the post count and also change the zustad state
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
      });
      if (!decrementPostsResponse.ok) {
        throw new Error("Error updating user posts count!");
      }
      const updatedUser = await decrementPostsResponse.json();
      console.log("Updated user posts count:", updatedUser);  

      // Update Zustand state with the new user data
      useUsers.setState((state) => ({
        selectedUser: {
          ...state.selectedUser,
          posts: updatedUser.data.posts,
        },
      }));
      console.log("Updated Zustand state with new user data:", updatedUser.data.posts);
      

      // Update the Zustand state with the new user data
      onClose(); // Close modal after delete
      console.log("Modal closed after delete.");
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false); // Reset deletion state
    }
  };

  const handleBack = () => {
    const query = new URLSearchParams({ postName: post.m?.properties.name }).toString();
    console.log("Query:",post.m?.properties.name)
  router.push(`/editPost?${query}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ✅ Modal Container */}
          <div className="relative w-[40vw] h-[70vh] bg-white rounded-lg overflow-hidden">
            {/* ✅ 3 Dots (More Options) in Top-Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions); // ✅ Toggle the dropdown correctly
              }}
              className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
            {/* ✅ Dropdown Menu for Options */}
            {showOptions && (
              <div className="absolute top-12 right-4 bg-white shadow-md rounded-lg w-40">
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={handleBack}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => alert("Details feature coming soon!")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </button>
              </div>
            )}
            {/* ✅ Post Image Maximized */}
            <img
              src={post.m?.properties?.imageUrl || "/placeholder.svg"}
              alt={`Post ${post.id}`}
              className="w-full max-w-[50vh] max-h-[50vh] object-contain bg-black m-auto"
            />
            {/* ✅ Post Description Below */}
            <div className="p-4 bg-white">
              <p className="text-gray-700 text-center">
                {post.m?.properties?.description || "No description available."}
              </p>
            </div>
            {/* ✅ Close Button at Bottom Center */}
            <div className="mt-4 flex justify-center mb-4">
              <Button
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                <X className="h-5 w-5 inline-block mr-1" /> Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
