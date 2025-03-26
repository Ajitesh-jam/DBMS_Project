"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import useUsers from "@/hooks/user.zustand";

export default function NotificationPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useUsers((state) => state.selectedUser);
  const [followRequestProps, setFollowRequestProps] = useState({});
  // ✅ Fetch Invitations on Page Load
  useEffect(() => {
    async function fetchInvitations() {
      try {
        const response = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: {  },
            edgeLabel: "FOLLOW_REQUESTED",
            edgeWhere: {},// invitation being viewed
            adjNodeLabel: ["USER"],
            adjWhere: { name: user.name }
          }),
        });

        if (!response.ok) {
          throw new Error("Error fetching invitations.");
        }

        const data = await response.json();
        setInvitations(data || []);
        setFollowRequestProps(data.properties);
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
        // 1. Delete FOLLOW_REQUESTED edge
        const deleteResponse = await fetch("/api/deleteEdge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startNodeLabel: ["USER"],
            startNodeWhere: { name: invitation?.m.properties.name },
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
            startNodeWhere: { name: invitation.name },
            endNodeLabel: ["USER"],
            endNodeWhere: { name: user.name },
            edgeLabel: "FOLLOWS",
            properties: followRequestProps,
          }),
        });
  
        if (!createResponse.ok) {
          throw new Error("Error creating follow edge!");
        }
  
        console.log("Follow request accepted successfully!");
        setShowPopup(false);
      } catch (error) {
        console.error("Error accepting invitation:", error);
      }
  };

  // ✅ Handle Reject Invitation
  const handleReject = async (invitation, showAlert = true) => {
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
          startNodeWhere: { name: invitation.name },
          endNodeLabel: ["USER"],
          endNodeWhere: { name: user.name },
          edgeLabel: "FOLLOW_REQUESTED",
        }),
      });

      if (!response.ok) {
        throw new Error("Error rejecting invitation.");
      }

      if (showAlert) {
        alert("Invitation rejected.");
      }

      // Update the UI to remove rejected invitation
      setInvitations((prev) =>
        prev.filter((inv) => inv.name !== invitation.name)
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

      {invitations.length === 0 ? (
        <p className="text-gray-600">No pending invitations.</p>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold">{invitation.name}</h3>
                <p className="text-sm text-gray-600">
                  {invitation.email || "No email provided"}
                </p>
              </div>
              <div className="flex gap-2">
                {/* ✅ Approve Button */}
                <Button
                  onClick={() => handleApprove(invitation)}
                  disabled={loading}
                  className="bg-green-500 text-white hover:bg-green-600 px-4 py-2"
                >
                  <CheckCircle className="h-5 w-5 mr-1" /> Approve
                </Button>

                {/* ❌ Reject Button */}
                <Button
                  onClick={() => handleReject(invitation)}
                  disabled={loading}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2"
                >
                  <XCircle className="h-5 w-5 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
