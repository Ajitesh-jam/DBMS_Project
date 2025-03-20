import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the initial User data structure
const initialState = {
  selectedUser: {
    name: "Dummy User",
    DOB: "2-34-2224",
    imageUrl:
      "https://img.myloview.cz/plakaty/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg",
    email: "default@gmail.com",
    phone: "0000000000",
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
