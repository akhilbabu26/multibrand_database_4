import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function AdminRouter() {
  const { currentUser, isAuthenticated, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}