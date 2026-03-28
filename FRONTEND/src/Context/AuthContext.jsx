import React, { createContext, useEffect, useState } from 'react'
import { api } from "../api/Api"

export const AuthContext = createContext()

function AuthProvider({children}) {

  const [currentUser, setCurrentUser] = useState(() => {
  const storedUser = localStorage.getItem("user")
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      localStorage.removeItem("user") // Clear invalid data
      return null
    }
  });

  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true) // Add loading state

  useEffect(() => {
    const fetchAllUser = async () => {

      try {
        setLoading(true)
        const response = await api.get("/users")
        setAllUsers(response?.data || [])
      } catch (err) {
        setAllUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchAllUser()
  }, [])

  const updateCurrentUser = (userData) => {
    setCurrentUser(userData)
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      localStorage.removeItem("user")
    }
  };

  // Auto-refresh user on focus
  useEffect(() => {
    const refreshUserData = async () => {
      if (!currentUser?.id) return
    
      try {
        const response = await api.get(`/users/${currentUser.id}`)
        const latestUserData = response.data
        
        // Only update if data actually changed
        if (JSON.stringify(latestUserData) !== JSON.stringify(currentUser)) {
          updateCurrentUser(latestUserData);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error)
      }
    };

    // Refresh window
    const handleFocus = () => {
      refreshUserData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser?.id]);

  const value = {
    currentUser, 
    setCurrentUser: updateCurrentUser,
    allUsers, 
    setAllUsers,
    loading 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider