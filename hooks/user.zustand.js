import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the initial User data structure
const initialState = {
  selectedUser: {
    name: "Dummy User",
    DOB: "2-34-2224",
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzgh0Pd-fCG2LnUPP92d1DP7y2cdnugqFXyw&s",
    email: "default@gmail.com",
    phone: "0000000000",
    followerscount: 0,
    posts: 0,
    followingcount: 0
  },
  lastUpdated: Date.now(), // Track last activity time
};

// Create Zustand store with expiration logic
const useUsers = create(
  persist(
    (set, get) => {
      // Function to update state and reset timestamp
      const updateState = (newState) => {
        set({ ...newState, lastUpdated: Date.now() });
      };

      return {
        ...initialState,

        // Add a new User
        addUser: (User) => updateState({ selectedUser: User }),

        // Remove a User (reset to default)
        removeUser: () => updateState({ selectedUser: initialState.selectedUser }),

        // Set a new User temporarily
        setNewUser: (User) => updateState({ selectedUser: User }),

        // Check expiration on initialization
        checkExpiration: () => {
          const state = get();
          const timeDiff = Date.now() - state.lastUpdated;
          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (timeDiff > oneDay) {
            set({ selectedUser: initialState.selectedUser, lastUpdated: Date.now() });
          }
        },
      };
    },
    {
      name: "User-store", // Key for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

// Run expiration check on store initialization
useUsers.getState().checkExpiration();

export default useUsers;

