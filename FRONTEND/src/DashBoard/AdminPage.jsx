import { useState } from "react";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, Package, ShoppingCart, LogOut } from "lucide-react";
import logo from "../assets/unnamed.jpg"; 
import useFetch from "../Hooks/useFetch";

function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true) 
  const location = useLocation()
  const navigate = useNavigate()
  const datas = JSON.parse(localStorage.getItem('user'))

  // all users
  const {data} = useFetch("/users")
  const userData = data?.filter(user => user?.role !== "Admin")

  const navItems = [
    { icon: Home, label: "Dashboard", path: "dashboard" },
    { icon: Users, label: "Users", path: "userinfo" },
    { icon: Package, label: "Products", path: "productInfo" },
    { icon: ShoppingCart, label: "Orders", path: "orderInfo" },
  ]

  const isActive = (path) => location.pathname.includes(path)

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user")
    
    // Clear any other related data
    localStorage.removeItem("cart")
    localStorage.removeItem("wishlist")
    
    // Redirect to login page
    navigate("/login")
    
    // Optional: Show confirmation message
    console.log("Admin logged out successfully")
  }

  const currentPage = navItems.find(item => isActive(item.path))?.label || "Dashboard"

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Deep Charcoal/Black */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-950 text-white transition-all duration-300 flex flex-col border-r border-gray-800 shadow-xl z-20`}
      >
        {/* Header - Branding Area */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
          <div className="flex items-center flex-1">
            {sidebarOpen && (
              <div className="flex items-center gap-3 flex-1">
                <img 
                  src={logo}
                  alt="MultiBrand Logo" 
                  className="w-8 h-8 rounded-md object-cover"
                />
                <div 
                  className="cursor-pointer"
                >
                  <h2 className="text-xl font-bold text-white tracking-wider">
                    MULTI<span className="text-gray-400">BRAND</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-normal">ADMIN SIDE</p> 
                </div>
              </div>
            )} 
          </div>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded-lg text-center transition-colors ml-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation - Clean, High-Contrast Links */}
        <nav className="flex-1 p-3 space-y-1.5">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ${
                  active
                    ? "bg-gray-600 text-white font-semibold shadow-md shadow-emerald-600/30"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-lg">{item.label}</span>}
              </div>
            )
          })}
        </nav>

        {/* Logout - Subtle Red Accent */}
        <div className="p-4 border-t border-gray-800">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-300 hover:bg-red-700/80 hover:text-white transition-colors duration-150"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top Bar - Clean, Elevated Header */}
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            {currentPage}
          </h2>
          
          <div className="flex items-center gap-5">
            {/* Admin Profile */}
            <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-700 font-medium hidden sm:block">
                  Welcome Admin <strong>{datas?.name}</strong>
                </span>
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                  <img 
                    src={logo}
                    alt="Admin" 
                    className="w-full h-full object-cover"
                  />
                </div>
            </div>
          </div>
        </header>

        {/* Content Area - Focus on White Space */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white border border-gray-200 rounded-xl min-h-full p-6 shadow-lg"> 
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default React.memo(AdminPage)
