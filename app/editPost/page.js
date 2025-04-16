"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MapPin, Smile, ArrowLeft } from "lucide-react"
import useUsers from "@/hooks/user.zustand"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation";

import { Suspense } from 'react'
 
function CreatePost() {

    const searchParams = useSearchParams();
    const postName = searchParams.get("postName");
  
    
    console.log("Post:", postName);
    const user = useUsers((state) => state.selectedUser) || { name: "", email: "", location: "" };
    const [imageURL, setImageUrl] = useState("")
    
    // const [imageUrlInput, setImageUrlInput] = useState(""); // for user typing
    // const [shouldShowImage, setShouldShowImage] = useState(false);
    useEffect(() => {
        const fetchPost = async () => {
          try {
            console.log("Post:", postName);
            const response = await fetch("/api/getAdjNodeByLabel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                label: ["USER"],
                where: { name: user.name, email: user.email },
                edgeLabel: ["POSTED_BY"],
                edgeWhere: [],
                adjNodeLabel: ["POST"],
                adjWhere: { name: postName },
              }),
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            const data = await response.json();


            setVisibility(data[0]?.m?.properties?.visibility);
            setLocation(data[0]?.m?.properties?.location);
            setDescription(data[0]?.m?.properties?.description);

            console.log("properties:", data[0]?.m?.properties);
          } catch (error) {
            console.error("Error:", error);
          }
        };
      
        fetchPost();
      }, [postName, user]);
    
  
  const [visibility, setVisibility] = useState(false)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState(user.location)
  const [isValidImage, setIsValidImage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  // Handle Image URL Change
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setIsValidImage(true);
    
  };


  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setIsValidImage(false)
  }


  const loadImage = () => {
    if (imageURL) {
      setIsLoading(true)
    }
  } 
  

  // Get Current Location
  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`)
        },
        (error) => {
          console.error("Error fetching location:", error)
          setLocation("Unable to retrieve location")
        }
      )
    } else {
      setLocation("Geolocation is not supported by this browser")
    }
  }

  
  async function handleUpdate() {
    try {
      // Validate inputs
      if (!imageURL) {
        alert("Please provide an image URL");
        return;
      }
      
      console.log("Image URL:", imageURL);
      console.log("Description:", description);
      console.log("Location:", location);
      
      const response = await fetch("/api/updateAdjacentNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startNodeLabel: "USER", // Changed from array to string
          startNodeWhere: { "name": user.name, "email": user.email },
          endNodeLabel: "POST", // Changed from array to string
          endNodeWhere: { name: postName },
          edgeLabel: "POSTED_BY",
          updates: { 
            "imageURL": imageURL, 
            "description": description,
            "location": location,
            "visibility": visibility
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Update successful:", data);
      
      // Navigate to profile page
      router.push("/profile");
    } catch (error) {
      console.error("Error updating post:", error);
      // Provide user feedback
      alert(`Failed to update post: ${error.message}. Please try again.`);
    }
  }
  async function handleBack() {
    router.push("/profile");
  }
  return (

    <Suspense>
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={handleBack} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Create new post</h1>
        <Button onClick={handleUpdate} variant="link" className="text-blue-500 font-semibold">

          Share

        </Button>
      </div>

      {
        user.name !== "Dummy User" ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Image preview area */}
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
              {!imageURL && (
                <div className="text-center p-6">
                  <div className="mb-4 text-gray-400">Enter an image URL to preview</div>
                  <Input
                    type="text"
                    placeholder="Paste image URL here"
                    className="max-w-md bg-gray-800 border-gray-700"
                    value={imageURL}
                    onChange={handleImageUrlChange}
                  />
                  <Button
                    className="mt-4 bg-blue-500 hover:bg-blue-600"
                    onClick={loadImage}
                    disabled={!imageURL}
                  >
                    Load Image
                  </Button>
                </div>
              )}

              {imageURL && (
                <>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {!isValidImage ? (
                    <div className="text-center p-6 text-red-500">
                      Invalid image URL. Please try another URL.
                      <Button className="mt-4 block mx-auto bg-gray-800" onClick={() => setImageUrl("")}>
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageURL || "/placeholder.svg"}
                        alt="Post preview"
                        fill
                        className="object-contain"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-800 flex flex-col">
              {/* User info */}
              <div className="p-4 flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{user.name} </span>
              </div>

              {/* Description */}
              <div className="p-4 border-b border-gray-800">
                <div className="text-sm text-gray-400 mb-2">Description:</div>
                <Textarea
                  placeholder="Write a caption..."
                  className="bg-transparent border-none resize-none h-24 focus-visible:ring-0 p-0"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <Smile className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">{description?.length}/2,200</span>
                </div>
              </div>

              <div className="p-4 border-b border-gray-800">
                <div className="text-sm text-gray-400 mb-2">Visibility:</div>

                {/* Toggle Circles with Labels */}
                <div className="flex gap-6 mb-2">
                  {/* Option for 1 */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setVisibility(1)}
                      className={`w-5 h-5 rounded-full border border-gray-400 ${visibility === 1 ? "bg-gray-400" : "bg-transparent"
                        }`}
                      aria-label="Visibility 1"
                    />
                    <span className="text-xs text-gray-400 mt-1">show</span>
                  </div>

                  {/* Option for 0 */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setVisibility(0)}
                      className={`w-5 h-5 rounded-full border border-gray-400 ${visibility === 0 ? "bg-gray-400" : "bg-transparent"
                        }`}
                      aria-label="Visibility 0"
                    />
                    <span className="text-xs text-gray-400 mt-1">hide</span>
                  </div>
                </div>
              </div>

              {/* Add Location */}
              <button
                className="p-4 flex items-center justify-between border-b border-gray-800"
                onClick={handleAddLocation}
              >
                <span>Add Location</span>
                <MapPin className="w-5 h-5 text-gray-400" />
              </button>

              {location && (
                <div className="p-4 text-xs text-blue-500 border-b border-gray-800">
                  📍 {location}
                </div>
              )}
            </div>
          </div>
        ) :
          (
            <div className="flex flex-1 items-center justify-center">
              <h1 className="text-lg font-semibold">Please login to create a post</h1>
              <Link href="/login" className="text-blue-500 font-semibold ml-2">
                Login
              </Link>
            </div>
          )
      }



    </div>
  </Suspense>
  )
}



export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-4 text-white">Loading post editor...</div>}>
      <CreatePost />
    </Suspense>
  );
}
