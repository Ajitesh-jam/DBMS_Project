"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAndSampleUsers = async () => {
      setLoading(true);

      try {
        // Fetch all users using getNodeByLabel API
        const response = await fetch("/api/getNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
          alert("No User Found");
          return;
        }

        console.log("Fetched user data:", data);

        const allUsers = await Promise.all(
          data.map(async (user) => {
            const name = user.n.properties.name;
            const pagerank = user.n.properties.pagerank;
            // Fetch latest post for this user using api/getAdjNodeByLabel
            const postResponse = await fetch("/api/getAdjNodeByLabel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                label: ["USER"],
                adjNodeLabel: ["POST"],
                where: {
                  name: name,
                },
              }),
            });

            if (!postResponse.ok) {
              throw new Error(`HTTP error! Status: ${postResponse.status}`);
            }
            console.log("Post response:", postResponse);
            const postData = await postResponse.json();
            if (postData.length === 0) {  
              console.log("No posts found for user:", name);
            }
            console.log("Fetched post data:", postData);
            


            const post = ""; // Replace with actual post data if needed
            return {
              name,
              pagerank,
              post,
            };
          })
        );

        const validUsers = await allUsers.filter((user) => user !== null);

        // Sort with respect to pagerank
        validUsers.sort((a, b) => b.pagerank - a.pagerank);
        const sampledUsers = validUsers; // Sample top 10 users

        console.log("Sampled user data:", sampledUsers);
        setUsers(sampledUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSampleUsers();
  }, []);

  const filteredUsers = users;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Explore Top Users</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by user name..."
            className="w-full p-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </motion.div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-black">NAME: {user.name}</h2>
              <p className="text-gray-500">PageRank: {user.pagerank}</p>
              <p className="text-gray-700">Post: {user.post}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
