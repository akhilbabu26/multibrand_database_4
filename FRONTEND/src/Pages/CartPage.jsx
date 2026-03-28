import React, { useContext, useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { api } from "../api/Api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function CartPage() {
  const [currentUser, setCurrentUser] = useState()
  const [reload, setReload] = useState(false) 
  const navigate = useNavigate()
  const { data, loading } = useFetch("/users", reload)
  const { setCurrentUser: setAuthUser } = useContext(AuthContext)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    setCurrentUser(storedUser)
  }, [])

  const currentUserdata = data?.find((val) => val.email === currentUser?.email)

   //  Prevent rendering 
  if (loading || !currentUserdata) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600 text-lg">Loading cart...</p>
      </div>
    );
  }

  // Remove item from cart
  const remove = async (product_id) => {
    try {
      const updatedCart = currentUserdata.cart.filter(
        (item) => item.product_id !== product_id
      )

      await api.patch(`/users/${currentUserdata.id}`, {
        cart: updatedCart,
      })

      // Update local storage
      const updatedUser = { ...currentUserdata, cart: updatedCart }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setAuthUser(updatedUser)

      setReload((prev) => !prev)
      toast.success("Removed from cart")
    } catch (err) {
      console.log(err)
      toast.error("not removing item")
    }
  }

  // Update quantity
  const updateQuantity = async (product_id, newQty) => {
    if (newQty < 1) return

    const updatedCart = currentUserdata.cart.map(item =>
      item.product_id === product_id ? { ...item, quantity: newQty } : item
    )

    await api.patch(`/users/${currentUserdata.id}`, { cart: updatedCart })
    
    // Update local storage
    const updatedUser = { ...currentUserdata, cart: updatedCart }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setAuthUser(updatedUser)
    
    setReload(!reload)
  }

  // Update size
  const updateSize = async (product_id, newSize) => {
    const updatedCart = currentUserdata.cart.map(item =>
      item.product_id === product_id ? { ...item, size: newSize } : item
    )
    await api.patch(`/users/${currentUserdata.id}`, { cart: updatedCart })
    
    // Update local storage
    const updatedUser = { ...currentUserdata, cart: updatedCart }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setAuthUser(updatedUser)
    
    setReload(!reload)
  }

  // Calculate total
  const totalCart = currentUserdata?.cart || []
  const totalAmount = totalCart.reduce(
    (sum, item) => sum + (item.sale_price || Math.round(
      item.original_price - (item.original_price * item.discount_percentage) / 100
    )) * item.quantity, 0
  )

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-6">Your Cart</h1> */}

      {/* CART ITEMS */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUserdata?.cart?.length > 0 ? (
          currentUserdata.cart.map((product) => (
            <div
              key={product.product_id}
              className="group relative bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition border"
            >
              <img
                alt={product.name}
                src={product.image_url}
                className="w-full h-64 object-cover rounded-md bg-gray-200"
              />

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-sm text-gray-500">{product.color}</p>
                  {product.sizes && product.sizes.length > 0 && (
                    <select
                      value={product.size || ""}
                      onChange={(e) => updateSize(product.product_id, e.target.value)}
                      className="text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded px-2 py-0.5 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="" disabled>Select Size</option>
                      {product.sizes.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  {product.gender && (
                    <span className="bg-gray-50 px-2 py-0.5 rounded text-xs font-semibold border border-gray-200 text-gray-500">
                      {product.gender}
                    </span>
                  )}
                  {product.category && (
                    <span className="bg-indigo-50 px-2 py-0.5 rounded text-xs font-semibold border border-indigo-100 text-indigo-600">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 line-through">
                    ₹{product.original_price}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {product.discount_percentage}% OFF
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{Math.round(
                      product.original_price -
                        (product.original_price * product.discount_percentage) / 100
                    )}
                  </span>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    className="px-3 py-1 bg-gray-100 rounded-full border"
                    onClick={() => updateQuantity(product.product_id, product.quantity - 1)}
                  >
                    -
                  </button>

                  <span className="px-4 py-1 border rounded-md bg-white">
                    {product.quantity}
                  </span>

                  <button
                    className="px-3 py-1 bg-gray-100 rounded-full border"
                    onClick={() => updateQuantity(product.product_id, product.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => remove(product.product_id)}
                  className="bg-red-600 text-white px-3 py-2 rounded mt-2 w-full hover:bg-red-700 transition"
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <button 
              onClick={() => navigate("/")}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* CHECKOUT SECTION */}
      {currentUserdata?.cart?.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-6 mt-8 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">Subtotal:</p>
            <p className="text-lg font-bold">₹{totalAmount}</p>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Shipping and taxes calculated at checkout.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
            
            <button
              onClick={() => {
                const missingSize = currentUserdata.cart.some(item => item.sizes?.length > 0 && !item.size);
                if (missingSize) {
                  toast.error("Please select a size for all items in your cart");
                  return;
                }
                navigate("/checkOut");
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
