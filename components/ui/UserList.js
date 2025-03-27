// /components/UserList.jsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserList({ apiEndpoint, pageTitle }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: {}, // Fetch all users
            edgeLabel: pageTitle === "Followers" ? "FOLLOWS" : "FOLLOWS",
            edgeWhere: {},
            adjNodeLabel: ["USER"],
            adjWhere: {}, // No specific filter
          }),
        });

        if (!response.ok) {
          throw new Error("Error fetching users.");
        }

        const data = await response.json();
        setUsers(data || []);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [apiEndpoint, pageTitle]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading {pageTitle}...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg">No {pageTitle.toLowerCase()} found.</p>
      </div>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id || user?.m?.properties?.name}
            className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
            onClick={() => router.push(`/profile/${user?.m?.properties?.name}`)}
          >
            <div>
              <h3 className="text-sm text-gray-600">
                {user?.m?.properties?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user?.m?.properties?.email || "No email provided"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
