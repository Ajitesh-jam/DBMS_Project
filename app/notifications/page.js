"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import useUsers from "@/hooks/user.zustand";
import { toNativeNumber } from "../api/connection/neo";

export default function NotificationPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useUsers((state) => state.selectedUser);
  
  const [followRequestProps, setFollowRequestProps] = useState({});


  useEffect(() => {
    async function fetchInvitations() {
      try {
        const response = await fetch("/api/getStartAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: {},
            edgeLabel: "FOLLOW_REQUESTED",
            edgeWhere: {}, // Invitation being viewed
            adjNodeLabel: ["USER"],
            adjWhere: { name: user.name },
          }),
        });

        if (!response.ok) {
          throw new Error("Error fetching invitations.");
        }

        const data = await response.json();
        setInvitations(data || []);
        console.log("data",data)
        // Extract and set follow request properties correctly
        if (data.length > 0) {
          setFollowRequestProps(data[0]?.properties || {});
        }
      } catch (error) {
        console.error("Error loading invitations:", error);
      }
    }

    if (user?.name) {
      fetchInvitations();
    }
  }, [user]);

  // ✅ Handle Approve Invitation
  const handleApprove = async (invitation) => {
    try {
      setLoading(true);

      // 1. Delete FOLLOW_REQUESTED edge
      const deleteResponse = await fetch("/api/deleteEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: invitation?.n?.properties?.name },
          endNodeLabel: ["USER"],
          endNodeWhere: { name: user.name },
          edgeLabel: "FOLLOW_REQUESTED",
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Error deleting follow request!");
      }

      // 2. Create FOLLOWS edge with same properties
      const createResponse = await fetch("/api/createEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: invitation?.n?.properties?.name },
          endNodeLabel: ["USER"],
          endNodeWhere: { name: user.name },
          edgeLabel: "FOLLOWS",
          properties: followRequestProps, // Pass the correct properties
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Error creating follow edge!");
      }

      alert("Follow request approved successfully!");
      const oldFollowersCount = toNativeNumber(user?.followerscount);
      console.log("Old followers count:", oldFollowersCount);
     

      setInvitations((prev) =>
        prev.filter((inv) => inv.n?.properties?.name !== invitation.n?.properties?.name)
      );
    } catch (error) {
      console.error("Error approving invitation:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleReject = async (invitation) => {
    try {
      setLoading(true);

      // Delete FOLLOW_REQUESTED edge after rejecting
      const response = await fetch("/api/deleteEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"],
          startNodeWhere: { name: invitation?.n?.properties?.name },
          endNodeLabel: ["USER"],
          endNodeWhere: { name: user.name },
          edgeLabel: "FOLLOW_REQUESTED",
        }),
      });

      if (!response.ok) {
        throw new Error("Error rejecting invitation.");
      }

      alert("Invitation rejected.");


      setInvitations((prev) =>
        prev.filter((inv) => inv.n?.properties?.name !== invitation.n?.properties?.name)
      );
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Pending Invitations</h1>

      {/* ✅ No Invitations Available */}
      {invitations.length === 0 ? (
        <p className="text-gray-600">No pending invitations.</p>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation, index) => (
            <div
              key={invitation.id || `inv-${index}`} // ✅ Fallback for missing id
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md"
            >
              {/* ✅ Invitation Details */}
              <div>
                <h3 className="text-md font-semibold text-gray-800">
                  {invitation?.n?.properties?.name || "Unknown Name"}
                </h3>
                <p className="text-sm text-gray-600">
                  {invitation?.n?.properties?.email || "No email provided"}
                </p>
              </div>

              {/* ✅ Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(invitation)}
                  disabled={loading}
                  className={`bg-green-500 text-white hover:bg-green-600 px-4 py-2 flex items-center ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {loading ? "Approving..." : "Approve"}
                </Button>

                <Button
                  onClick={() => handleReject(invitation)}
                  disabled={loading}
                  className={`bg-red-500 text-white hover:bg-red-600 px-4 py-2 flex items-center ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {loading ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
