"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
//import { Search } from "lucide-react";
import Image from "next/image";

//import { Input } from "@/components/ui/input";
export default function Explore() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAndSampleUsers = async () => {
      setLoading(true);

      try {
        
        const allUsers = await fetch("/api/getAllUsers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          
        });
        if (!allUsers.ok) {
          throw new Error(`HTTP error! Status: ${allUsers.status}`);
        }
        const allUsersData = await allUsers.json();
        console.log("All users data:", allUsersData);
        


         setUsers(allUsersData);
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
          {/* <Input
            type="text"
            placeholder="Search by user name..."
            className="w-full p-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" /> */}
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
              {user.imageURL && (
                <Image
                  src={user.imageURL}
                  alt={`Image of ${user.name}`}
                  width={100}
                  height={100}
                  className="rounded-full mb-4"
                />
              )}
             
              <h2 className="text-black">NAME: {user.name}</h2>
              <p className="text-gray-500">PageRank: {user.pagerank}</p>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
