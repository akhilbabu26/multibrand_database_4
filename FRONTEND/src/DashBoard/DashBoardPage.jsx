import React, { useEffect, useState } from 'react'
import api from '../services/api'
import useFetch from '../Hooks/useFetch'

function DashBoardPage() {
  const [users, setUsers] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.get('/admin/users', { params: { page: 1, limit: 100 } }),
          api.get('/admin/orders', { params: { page: 1, limit: 500 } }),
        ])
        if (cancelled) return
        const usersInner = usersRes;
        const list = usersInner?.users
        setUsers(Array.isArray(list) ? list : [])
        const ordersInner = ordersRes;
        setAllOrders(Array.isArray(ordersInner?.orders) ? ordersInner.orders : [])
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setUsers([])
          setAllOrders([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const regularUsers = users.filter(
    (user) => String(user.role ?? '').toLowerCase() !== 'admin'
  )
  const { data, loading: productsLoading } = useFetch("/products")

  const isBlocked = (user) => Boolean(user.is_blocked ?? user.isBlocked)

  // Order statistics
  const pendingOrders = allOrders.filter(order => order.status === 'pending')
  const confirmedOrders = allOrders.filter(order => order.status === 'confirmed')
  const shippedOrders = allOrders.filter(order => order.status === 'shipped')
  const deliveredOrders = allOrders.filter(order => order.status === 'delivered')
  const cancelledOrders = allOrders.filter(order => order.status === 'cancelled')

  const totalRevenue = deliveredOrders.reduce(
    (total, order) => total + Number(order.total_amount ?? order.totalAmount ?? 0),
    0
  )

  if (loading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your store performance</p>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{regularUsers.length}</p>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              {regularUsers.filter((user) => !isBlocked(user)).length}
            </p>
            <p className="text-gray-600 text-sm">Active Users</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-red-600">
              {regularUsers.filter((user) => isBlocked(user)).length}
            </p>
            <p className="text-gray-600 text-sm">Blocked Users</p>
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{data.length}</p>
            <p className="text-gray-600 text-sm">Total Products</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{allOrders.length}</p>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{confirmedOrders.length}</p>
            <p className="text-gray-600 text-sm">Confirmed</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{shippedOrders.length}</p>
            <p className="text-gray-600 text-sm">Shipped</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-600">{deliveredOrders.length}</p>
            <p className="text-gray-600 text-sm">Delivered</p>
          </div>
        </div>
        
        {/* Cancelled Orders */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-red-600">{cancelledOrders.length}</p>
            <p className="text-gray-600 text-sm">Cancelled Orders</p>
          </div>
          {/* success rate */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">
              {allOrders.length > 0 && deliveredOrders.length > 0
                ? Math.round((deliveredOrders.length / allOrders.length) * 100)
                : 0}
              %
            </p>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-700">Active Customers</p>
            <p className="text-2xl font-bold text-green-600">{regularUsers.filter((user) => !isBlocked(user)).length}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Products Available</p>
            <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Orders Today</p>
            <p className="text-2xl font-bold text-purple-600">
              {allOrders.filter((order) => {
                const d = order.created_at ?? order.orderDate
                return d && new Date(d).toDateString() === new Date().toDateString()
              }).length}
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoardPage
