"use client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"
import useUsers from "@/hooks/user.zustand"
import { useRouter } from "next/navigation"

export default function FriendHeader({ Friend, activeUserId }) {
  const [requestStatus, setRequestStatus] = useState("none") // 'none', 'requested', 'following'
  const [isLoading, setIsLoading] = useState(false)
  const user = useUsers((state) => state.selectedUser)
  const router = useRouter()
  // Function to persist follow state to localStorage
  const saveRequestState = (friendId, status) => {
    localStorage.setItem(`request_${friendId}`, status)
  }

  const getRequestState = (friendId) => {
    return localStorage.getItem(`request_${friendId}`) || "none"
  }

  // ✅ API call to create FOLLOW_REQUESTED edge
  const createFollowRequest = async () => {
    try {
      setIsLoading(true)
      console.log("Active User ID:", activeUserId)
      console.log("Friend ID:", Friend.id)

      const response = await fetch("/api/createEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"], // Active user sending the request
          startNodeWhere: { name: user.name }, // Active user's name
          endNodeLabel: ["USER"], // User receiving the request
          endNodeWhere: { name: Friend.name },
          edgeLabel: "FOLLOW_REQUESTED",
          properties: {},
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Follow request sent successfully:", data)

      // Update to requested state and persist
      setRequestStatus("requested")
      saveRequestState(Friend.id, "requested")
    } catch (err) {
      console.error("Error sending follow request:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // ❌ API call to delete FOLLOW_REQUESTED edge
  const deleteFollowRequest = async () => {
    try {
      setIsLoading(true)
      console.log("Deleting Follow Request...")
      console.log("Active User ID:", activeUserId)
      console.log("Friend ID:", Friend.id)

      const response = await fetch("/api/deleteEdge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: ["USER"], // Active user sending the request
          startNodeWhere: { name: user.name }, // Active user's name
          endNodeLabel: ["USER"], // User receiving the request
          endNodeWhere: { name: Friend.name },
          edgeLabel: "FOLLOW_REQUESTED",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Follow request deleted successfully:", data)

      // Reset to none state and update localStorage
      setRequestStatus("none")
      saveRequestState(Friend.id, "none")
    } catch (err) {
      console.error("Error deleting follow request:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔄 Toggle follow/unfollow logic
  const toggleFollow = () => {
    if (requestStatus === "none") {
      createFollowRequest() // Will set to Requested
    } else if (requestStatus === "requested") {
      deleteFollowRequest() // Will revert to Send Request
    }
  }

  // Load follow state from localStorage on component mount
  useEffect(() => {
    // Load request state from localStorage on component mount
    const initialRequestState = getRequestState(Friend.id)
    setRequestStatus(initialRequestState)

    // Here you could also add an API call to check if there's an existing FOLLOWS edge
    // and update the state accordingly
    const checkExistingRelationship = async () => {
      try {
        // Example API call to check for existing relationships
        const response = await fetch(`/api/checkEdge?from=${user.name}&to=${Friend.name}`)
        if (response.ok) {
          const data = await response.json()
          if (data.hasFollowEdge) {
            setRequestStatus("following")
            saveRequestState(Friend.id, "following")
          } else if (data.hasRequestEdge) {
            setRequestStatus("requested")
            saveRequestState(Friend.id, "requested")
          }
        }
      } catch (err) {
        console.error("Error checking relationship:", err)
      }
    }

    // Uncomment this when you have the API endpoint ready
    // checkExistingRelationship();

    console.log("Friend in header:", Friend)
  }, [Friend.id, user.name])

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Profile Picture */}
      <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden">
        <img src={Friend.imageUrl || "/placeholder.svg"} alt={Friend.name} className="object-cover" />
      </div>

      {/* User Info */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-xl font-bold">{Friend.name}</h1>
          <div className="flex gap-2">
            <Button
              variant={requestStatus === "none" ? "default" : "outline"}
              onClick={toggleFollow}
              className="h-9"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : requestStatus === "requested" ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Requested
                </>
              ) : requestStatus === "following" ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>

            <Button variant="outline" className="h-9">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <div className="text-center">
            <span className="font-bold">{Friend.posts}</span>
            <p className="text-sm text-muted-foreground">posts</p>
          </div>
          <div className="text-center cursor-pointer" onClick={() => router.push(`/followers`)}>
            <span className="font-bold">{Friend.followers}</span>
            <p className="text-sm text-muted-foreground">followers</p>
          </div>

          <div className="text-center cursor-pointer" onClick={() => router.push(`/following`)}>
            <span className="font-bold">{Friend.following}</span>
            <p className="text-sm text-muted-foreground">following</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          <h2 className="font-semibold">{Friend.name}</h2>
          <p className="text-sm mt-1 whitespace-pre-line">{Friend.bio}</p>
        </div>
      </div>
    </div>
  )
}
