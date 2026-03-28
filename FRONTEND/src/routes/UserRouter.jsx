import React, { useContext } from 'react'
import { AuthContext } from "../context/AuthContext"
import { Navigate, Outlet } from 'react-router-dom'
import Navbar from "../components/layout/Navbar/Navbar"

function UserRouter() {

    const { currentUser } = useContext(AuthContext)

    if (!currentUser) {
        return <Navigate to="/login" replace />
    }

    if (currentUser?.role === "Admin") {
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
