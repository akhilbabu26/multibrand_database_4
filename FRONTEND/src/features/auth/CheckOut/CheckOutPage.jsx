import React, { useContext, useState } from "react";
import { Formik, Field, Form } from "formik";
import { CheckoutValidation } from "./CheckValidation";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
import { api } from "../../../api/Api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const checkValues = {
  name: "",
  number: "",
  email: "",
  address: "",
  city: "",
  pinCode: "",
};

function CheckOutPage() {
  const { currentUser, setCurrentUser } = useContext(AuthContext) // Add setCurrentUser
  const { data } = useFetch("/users") // Remove reload we don't need it for data
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const currentUserdata = data.find((val) => val.email === currentUser?.email)

  const HandleClick = async (values) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      // Validate user data
      if (!currentUserdata) {
        throw new Error("User data not found")
      }

      if (!currentUserdata.cart || currentUserdata.cart.length === 0) {
        throw new Error("Cart is empty")
      }

      const orderData = {
        ...values,
        items: currentUserdata.cart,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
        status: "pending",
        totalAmount: currentUserdata.cart.reduce(
          (sum, item) => sum + (item.sale_price || 
            Math.round(item.original_price - (item.original_price * item.discount_percentage) / 100)
          ) * item.quantity, 
          0
        )
      }

      const newOrder = [...(currentUserdata.order || []), orderData]

      // Update user with new order and clear cart
      const response = await api.patch(`/users/${currentUserdata.id}`, {
        order: newOrder,
        cart: [] // Clear the cart after successful order
      })

      // Update local storage and context with the new user data
      const updatedUser = { ...currentUser, order: newOrder, cart: [] }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)

      toast.success("Order placed successfully:")
      navigate("/OrderPage")

    } catch (err) {
      console.error("Order failed:", err)
      toast.error(`Failed to place order`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {/* Show cart summary */}
      {currentUserdata?.cart?.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <p>{currentUserdata.cart.length} item(s) in cart</p>
          <p className="font-bold">
            Total: ₹{currentUserdata.cart.reduce(
              (sum, item) => sum + (item.sale_price || 
                Math.round(item.original_price - (item.original_price * item.discount_percentage) / 100)
              ) * item.quantity, 
              0
            )}
          </p>
        </div>
      )}

      {(!currentUserdata?.cart || currentUserdata.cart.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <Formik
          initialValues={checkValues}
          validationSchema={CheckoutValidation}
          onSubmit={HandleClick}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Field
                  type="tel"
                  name="number"
                  placeholder="Enter your phone number"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.number && touched.number && (
                  <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Field
                  type="text"
                  name="city"
                  placeholder="Enter your city"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.city && touched.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Field
                  component="textarea"
                  name="address"
                  placeholder="Enter your complete address"
                  rows="3"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.address && touched.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <Field
                  type="text"
                  name="pinCode"
                  placeholder="Enter your PIN code"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.pinCode && touched.pinCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid || !dirty}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </Form>
          )}
        </Formik>
      )}
      <button
          className="flex items-center mt-3 gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => navigate(-1)}
         >
          BACK
      </button>
    </div>
  )
}

export default CheckOutPage