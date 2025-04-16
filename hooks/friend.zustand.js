import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the initial Friend data structure
const initialState = {
  selectedFriend: {
    name: "Dummy Friend",
    DOB: "2-34-2224",
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzgh0Pd-fCG2LnUPP92d1DP7y2cdnugqFXyw&s",
    email: "default@gmail.com",
    phone: "0000000000",
    followers: 0,
    posts: 0,
    following: 0,
  },
  lastUpdated: Date.now(), // Track last activity time
};

// Create Zustand store with expiration logic
const useFriends = create(
  persist(
    (set, get) => {
      // Function to update state and reset timestamp
      const updateState = (newState) => {
        set({ ...newState, lastUpdated: Date.now() });
      };

      return {
        ...initialState,

        // Add a new Friend
        addFriend: (Friend) => updateState({ selectedFriend: Friend }),

        // Remove a Friend (reset to default)
        removeFriend: () => updateState({ selectedFriend: initialState.selectedFriend }),

        // Set a new Friend temporarily
        setNewFriend: (Friend) => updateState({ selectedFriend: Friend }),

        // Check expiration on initialization
        checkExpiration: () => {
          const state = get();
          const timeDiff = Date.now() - state.lastUpdated;
          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (timeDiff > oneDay) {
            set({ selectedFriend: initialState.selectedFriend, lastUpdated: Date.now() });
          }
        },
      };
    },
    {
      name: "Friend-store", // Key for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

// Run expiration check on store initialization
useFriends.getState().checkExpiration();

export default useFriends;

