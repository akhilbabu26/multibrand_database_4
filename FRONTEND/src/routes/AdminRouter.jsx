import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRouter() {
  const { currentUser } = useContext(AuthContext)

  if (!currentUser || currentUser.role !== "Admin") {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
