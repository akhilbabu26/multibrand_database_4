import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from "../../../context/AuthContext"

// Premium icons from react-icons (you need to install: npm install react-icons)
import { FiSearch, FiHeart, FiUser, FiLogOut, FiLogIn, FiShoppingBag, FiShoppingCart, FiClipboard } from 'react-icons/fi'
import { HiOutlineCube, HiOutlineGift, HiOutlineStar, HiOutlineTruck } from 'react-icons/hi'
import { IoMdMenu, IoMdClose } from 'react-icons/io'
import { RiUserLine, RiUserFollowLine } from 'react-icons/ri'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const { currentUser, setCurrentUser } = useContext(AuthContext) 

  const handleLogout = () => {
    localStorage.removeItem("user")
    setCurrentUser(null)
  }

  return (
    <div className="bg-white">
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel className="relative flex w-full max-w-xs flex-col bg-white pb-12 shadow-xl">
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-m-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            <div className="px-4 pt-6 space-y-3">
              {/* Search */}
              <button
                onClick={() => { navigate("/SearchPage"); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <FiSearch className="text-lg text-gray-500 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium">SEARCH</span>
              </button>

              {/* Orders */}
              <button
                onClick={() => { navigate("/orders"); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <FiClipboard className="text-lg text-gray-500 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium">ORDERS</span>
              </button>
              
              {/* Wishlist */}
              <button
                onClick={() => { navigate("/wishlist"); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <FiHeart className="text-lg text-gray-500 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium">WISHLIST</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => { navigate("/cart"); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <FiShoppingCart className="text-lg text-gray-500 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium">CART</span>
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white shadow-sm border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md bg-white p-2 text-gray-400 lg:hidden hover:bg-gray-50 transition-colors"
            >
              <IoMdMenu className="text-xl" />
            </button>

            {/* Logo */}
            <h2 
              className="ml-4 text-2xl font-bold tracking-tight text-gray-900 select-none cursor-pointer"
              onClick={() => navigate("/")}
            >
              MULTI<span className="text-gray-500 border-gray-300 ">BRAND</span>
            </h2>

            <div className="ml-auto flex items-center gap-6">

              {/* Search */}
              <Link
                to="/SearchPage"
                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors group relative"
                title="Search Products"
              >
                <FiSearch className="text-xl group-hover:scale-110 transition-transform" />
              </Link>
              {/* Orders */}
              <button
                className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
                onClick={() => navigate("/orders")}
                title="Order History"
              >
                <FiClipboard className="text-xl group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">ORDERS</span>
              </button>

              {/* Wishlist */}
              <button
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
                onClick={() => navigate("/wishlist")}
                title="Your Wishlist"
              >
                <FiHeart className="text-xl group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">WISHLIST</span>
              </button>

              {/* Cart */}
              <button
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
                onClick={() => navigate("/cart")}
                title="Shopping Cart"
              >
                <FiShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">CART</span>
              </button>

              {/* Login/Logout */}
              {currentUser ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all group shadow-sm"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <RiUserFollowLine className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">LOGOUT</span>
                  <span className="sm:hidden">OUT</span>
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all group shadow-sm"
                  onClick={() => navigate("/login")}
                  title="Login to Account"
                >
                  <RiUserLine className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">LOGIN</span>
                  <span className="sm:hidden">IN</span>
                </button>
              )}

            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}