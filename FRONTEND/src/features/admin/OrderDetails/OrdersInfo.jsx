import React, { useEffect, useState } from 'react'
import { api } from "../../../api/Api"
import toast from "react-hot-toast";

function OrdersInfo() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users")
      setUsers(res?.data || [])
    } catch (err) {
      console.error(err)
      alert("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  // Filter only regular users
  const regularUsers = users.filter(user => user.role !== "Admin")

  // Get all orders from all users
  const allOrders = regularUsers.flatMap(user => 
    (user.order || []).map(order => ({
      ...order,
      userName: user.name,
      userEmail: user.email,
      userId: user.id
    }))
  )

  // Sort orders by date
  const sortedOrders = allOrders.sort((a, b) => 
    new Date(b.orderDate) - new Date(a.orderDate)
  )

  const updateOrderStatus = async (orderId, newStatus, userId) => {
    try {
      // Find the user
      const user = users.find(u => u.id === userId)
      if (!user) return

      // Update the order status
      const updatedOrders = user.order.map(order =>
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      )

      // Update user in backend
      await api.patch(`/users/${userId}`, { order: updatedOrders })

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, order: updatedOrders }
          : u
      ))

      toast.success(`Order status updated to ${newStatus}`)
    } catch (err) {
      console.error(err)
      alert("Error updating order status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusOptions = (currentStatus) => {
    const options = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    }
    return options[currentStatus] || []
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{sortedOrders.length}</p>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {sortedOrders.filter(order => order.status === 'pending').length}
            </p>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {sortedOrders.filter(order => order.status === 'confirmed').length}
            </p>
            <p className="text-gray-600 text-sm">Confirmed</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {sortedOrders.filter(order => order.status === 'shipped').length}
            </p>
            <p className="text-gray-600 text-sm">Shipped</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">
              {sortedOrders.filter(order => order.status === 'delivered').length}
            </p>
            <p className="text-gray-600 text-sm">Delivered</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-100/50 border-b border-gray-200">
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide">Order Info</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide">Customer</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Items</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Amount</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Status</div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200/60">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <div key={order.orderId} className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200">
                  
                  {/* Order Info */}
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900">#{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900">{order.userName}</p>
                    <p className="text-sm text-gray-500">{order.userEmail}</p>
                  </div>

                  {/* Items */}
                  <div className="col-span-2 text-center">
                    <p className="font-medium text-gray-900">{order.items?.length || 0} items</p>
                    <p className="text-sm text-gray-500">
                      {order.items?.[0]?.name || 'No items'}
                      {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-center">
                    <p className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-center">
                    {getStatusOptions(order.status).length > 0 ? (  // if the getStatusOptions > 0
                      <select
                        value=""
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value, order.userId)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Update Status</option>
                        {getStatusOptions(order.status).map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400 text-sm">No actions</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No orders found</p>
                <p className="text-sm text-gray-400">Customers haven't placed any orders yet</p>
              </div>
            )}
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <div key={order.orderId} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.orderId}</p>
                      <p className="text-sm text-gray-500">{order.userName}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border 
                      ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold">₹{order.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Items</p>
                      <p className="font-semibold">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-xs">{order.userEmail}</p>
                    </div>
                  </div>

                  {getStatusOptions(order.status).length > 0 && (
                    <select
                      value=""
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value, order.userId)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Update Status</option>
                      {getStatusOptions(order.status).map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersInfo