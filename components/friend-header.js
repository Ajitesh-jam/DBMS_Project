"use client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {  UserPlus, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"


export default function FriendHeader({ Friend, user }) {
  const [requestStatus, setRequestStatus] = useState("none") // 'none', 'requested', 'following'
  const [isLoading, setIsLoading] = useState(false)
  // const user = useUsers((state) => state.selectedUser);
  // const Friend = useFriends((state) => state.selectedFriend);
  const [numberOfPosts, setNumberOfPosts] = useState(0);

  
  const createFollowRequest = async () => {
    try {
      setIsLoading(true)
      
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

    } catch (err) {
      console.error("Error sending follow request:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFollowRequest = async () => {
    if(user.name==="Dummy User" || Friend==="Dummy Friend" || requestStatus=="none") return;
    try {
      setIsLoading(true)
      console.log("Deleting Follow Request...")


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
          edgeLabel: (requestStatus=="following")?   "FOLLOWS": "FOLLOW_REQUESTED",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Follow request deleted successfully:", data)

      // Reset to none state and update localStorage
      setRequestStatus("none")
    } catch (err) {
      console.error("Error deleting follow request:", err)
    } finally {
      setIsLoading(false)
    }
  }


  const toggleFollow = () => {
    if(user.name==="Dummy User" || Friend==="Dummy Friend") return;
    console.log("Toggling follow status for:", requestStatus)
    if (requestStatus === "none") {
      console.log("Sending follow request...")
      createFollowRequest() // Will set to Requested
    } else 

      deleteFollowRequest() 
    
  }

  
  useEffect(() => {
  
    const checkExistingRelationship = async () => {
      try {
        // Example API call to check for existing relationships

        if(user.name==="Dummy User" || Friend==="Dummy Friend") return;
        const response = await fetch("/api/checkEdge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: "USER",
            where:{name: user.name},
            edgeLabel: "FOLLOWS",
            edgeWhere: {},
            adjNodeLabel: "USER",
            adjWhere: { name: Friend.name }
            
          }),
        }); 

        console.log("Response from checkEdge:", response)
        if (response.ok) {
          const data = await response.json();
          console.log("Data from checkEdge  here 2 :", data)
        
          if (data.edgeExists) {
            console.log("Edge exists 1")
            setRequestStatus("following")

          } else  {
            const response = await fetch("/api/checkEdge", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                label: "USER",
                where:{name: user.name},
                edgeLabel: "FOLLOW_REQUESTED",
                edgeWhere: {},
                adjNodeLabel: "USER",
                adjWhere: { name: Friend.name }
                
              }),
            }); 
         
            if (response.ok) {
              const data = await response.json();
              console.log("Data from checkEdge 1:", data.edgeExists)
            
              if (data.edgeExists) {
                console.log("Edge exists 2")
                setRequestStatus("requested")
              } 

              else{
                console.log("No edge exists")
                setRequestStatus("none")
              }
            }

          }
        }



        //fetch number of posts for the user
        const response2 = await fetch("/api/getAdjNodeByLabel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: ["USER"],
            where: { name: Friend.name },
            edgeLabel: "POSTED_BY",
            edgeWhere: {},
            adjNodeLabel: "POST",
            adjWhere: {},
          }),
        });
        if (!response2.ok) {
          throw new Error(`HTTP error! Status: ${response2.status}`);
        }
        const fetchedPosts = await response2.json();
        console.log("Fetched posts for friend:", fetchedPosts)
        setNumberOfPosts(fetchedPosts.length);
        
      } catch (err) {
        console.error("Error checking relationship:", err)
      }
    }
    checkExistingRelationship();

    console.log("Friend in header :", Friend)
  }, [user,Friend])

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Profile Picture */}
      <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden">
       
        <img src={Friend.imageURL || "/placeholder.svg"} alt={Friend.name} className="object-cover" />
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

           
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <div className="text-center">
            <span className="font-bold">{numberOfPosts} </span>
            <p className="text-sm text-muted-foreground">posts</p>
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
