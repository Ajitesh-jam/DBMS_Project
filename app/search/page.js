"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import UserSearchResults from "@/components/user-search-results"
import { debounce } from "@/lib/utils"

export default function SearchPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const [error, setError] = useState(null)



  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
           
  const getMockUsers = (term) => [
    {
      id: 1,
      username: `${term}_user`,
      fullName: `${term.charAt(0).toUpperCase() + term.slice(1)} Smith`,
      profileImage: "/placeholder.svg?height=50&width=50",
      followers: Math.floor(Math.random() * 10000),
    },
    {
      id: 2,
      username: `real_${term}`,
      fullName: `Alex ${term.charAt(0).toUpperCase() + term.slice(1)}`,
      profileImage: "/placeholder.svg?height=50&width=50",
      followers: Math.floor(Math.random() * 10000),
    },
    {
      id: 3,
      username: `${term}_official`,
      fullName: `Official ${term.charAt(0).toUpperCase() + term.slice(1)}`,
      profileImage: "/placeholder.svg?height=50&width=50",
      followers: Math.floor(Math.random() * 10000),
    },
    {
      id: 4,
      username: `${term}_fan`,
      fullName: `${term.charAt(0).toUpperCase() + term.slice(1)} Fan Page`,
      profileImage: "/placeholder.svg?height=50&width=50",
      followers: Math.floor(Math.random() * 10000),
    },
    {
      id: 5,
      username: `${term}_lover`,
      fullName: `${term.charAt(0).toUpperCase() + term.slice(1)} Enthusiast`,
      profileImage: "/placeholder.svg?height=50&width=50",
      followers: Math.floor(Math.random() * 10000),
    },
  ]


  const fetchUsers = async (term) => {
    if (!term || term.trim() === "") {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // API call to get user data
      const response = await fetch("/api/getNodeByLabel", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: ["USER"],
          where: { name: term },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("data",data);
      const user = data.length>0? data[0].n.properties :null;
      // If data is not an array or empty, use mock data
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No results found, using mock data.")
        setSearchResults(getMockUsers(term)) // Fallback to mock data
      } else {
        setSearchResults(data)
        



      setTimeout(() => {
        router.push("/friendProfile/" + user.name);
      }, 1500);
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch users. Please try again.")
      setSearchResults(getMockUsers(term)) // Fallback to mock data
    } finally {
      setIsSearching(false)
    }
  }


  const debouncedSearch = useCallback(
    debounce((term) => {
      fetchUsers(term)
    }, 500),
    [],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)

    // Cleanup to prevent unnecessary API calls
    return () => {
      if (debouncedSearch.cancel) {
        debouncedSearch.cancel()
      }
    }
  }, [searchTerm])

  // ✅ Handle user selection
  const handleUserSelect = (userId) => {
    router.push(`/friendProfile/${userId}`)
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>

      {/* Search Input with Icon */}
      <div className="relative mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search for users..."
            className="pl-10 pr-4 py-6 text-gray-700 w-full "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Clear Button */}
        {searchTerm && !isSearching && (
          <Button
            variant="ghost"
            size="sm"
            className="relative right-2 top-1/2 -translate-y-1/2 bg-gray-700 m-5"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Error Handling */}
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">{error}</div>}

      {/* Search Results */}
      <UserSearchResults                        
        results={searchResults}
        isLoading={isSearching}
        searchTerm={searchTerm}
        onUserSelect={handleUserSelect}
      />
    </div>
  )
}

