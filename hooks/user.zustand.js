import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the initial User data structure
const initialState = {
  selectedUser: {
    name: "saras",
    DOB: "2-34-2224",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzgh0Pd-fCG2LnUPP92d1DP7y2cdnugqFXyw&s",
    email: "saras@gmail.com",
    phone: "0000000000",
    followers: 0,
    posts: 0,
    following: 0,
  },
};

// Create the Zustand store for User management with persistence
const useUsers = create(
  persist(
    (set) => ({
      ...initialState,

      // Add a new User
      addUser: (User) => set(() => ({ selectedUser: User })),

      // Remove a User (reset to default)
      removeUser: () =>
        set(() => ({ selectedUser: initialState.selectedUser })),

      // Set a new User temporarily
      setNewUser: (User) => set(() => ({ selectedUser: User })),
    }),
    {
      name: "User-store", // Key for localStorage
    }
  )
);

export default useUsers;
