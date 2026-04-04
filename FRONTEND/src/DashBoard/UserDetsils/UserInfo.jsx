import React, { useEffect, useState } from 'react'
import api from '../../services/api'

function UserInfo() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/users")
      setUsers(res?.data || []) 
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      // Update user's blocked status
      await api.patch(`/users/${userId}`, {
        isBlocked: !currentStatus
      })
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isBlocked: !currentStatus }
          : user
      ))
      
      alert(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`)
    } catch (err) {
      console.log(err)
      alert('Error updating user status')
    }
  }

  // Filter out admin users
  const regularUsers = users.filter(user => user.role !== "Admin")

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and access</p>
        </div>

        {/* Stats  block no, total user, active user*/}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">
              {regularUsers.filter(user => !user.isBlocked).length}
            </p>
            <p className="text-gray-600 text-sm">Active Users</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-red-600">
              {regularUsers.filter(user => user.isBlocked).length}
            </p>
            <p className="text-gray-600 text-sm">Blocked Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-2">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-100/50 border-b border-gray-200">
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide ">User</div>
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide ">Email</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Role</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Status</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200/60">
            {regularUsers.length > 0 ? (
              regularUsers.map(user => (
                <div key={user.id} className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200">
                  
                  {/* User Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(user.create_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3">
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {user.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.isBlocked 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleBlockUser(user.id, user.isBlocked)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 text-sm font-medium ${
                        user.isBlocked ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {user.isBlocked ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        )}
                      </svg>
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">No users found</div>
                <div className="text-sm text-gray-400">All users are administrators</div>
              </div>
            )}
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {regularUsers.length > 0 ? (
              regularUsers.map(user => (
                <div key={user.id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isBlocked 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Role</p>
                      <p className="font-medium">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Joined</p>
                      <p className="font-medium">{new Date(user.create_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                    {/* block and unblock */}
                  <button
                    onClick={() => handleBlockUser(user.id, user.isBlocked)}  
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors duration-200 text-sm font-medium ${
                      user.isBlocked
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {user.isBlocked ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      )}
                    </svg>
                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No regular users found
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default UserInfo
