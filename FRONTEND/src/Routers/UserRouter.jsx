import React, { useContext } from 'react'
import { AuthContext } from '../Context/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../NavSections/NavBar/Navbar'

function UserRouter() {
  const { currentUser, isAuthenticated, loading } = useContext(AuthContext)
  const location = useLocation()

  // Wait for auth check to finish before deciding
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    // Save the page they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (currentUser?.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default UserRouter