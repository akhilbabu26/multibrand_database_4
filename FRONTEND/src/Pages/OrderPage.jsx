import { CheckIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import useFetch from "../hooks/useFetch";

export default function OrderPage() {
  const { currentUser } = useContext(AuthContext);
  const { data } = useFetch("/users");
  const [latestOrder, setLatestOrder] = useState(null);
  const navigate = useNavigate();

  const currentUserdata = data.find((val) => val.email === currentUser?.email);

  useEffect(() => {
    if (currentUserdata?.order && currentUserdata.order.length > 0) {
      // Get the most recent order (last one in the array)
      const orders = currentUserdata.order;
      const mostRecentOrder = orders[orders.length - 1];
      setLatestOrder(mostRecentOrder);
    }
  }, [currentUserdata]);

  // If no orders found
  if (!latestOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <CheckIcon className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            No Orders Found
          </h1>
          <p className="mt-2 text-gray-600">
            You haven't placed any orders yet.
          </p>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-500"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        
        {/* Success Message */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          
          {/* Order Details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Order ID:</strong> {latestOrder.orderId}
            </div>
            <div>
              <strong>Order Date:</strong> {new Date(latestOrder.orderDate).toLocaleDateString()}
            </div>
            <div>
              <strong>Status:</strong> 
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {latestOrder.status}
              </span>
            </div>
            <div>
              <strong>Total Amount:</strong> ₹{latestOrder.totalAmount?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Shipping Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {latestOrder.name}
            </div>
            <div>
              <strong>Email:</strong> {latestOrder.email}
            </div>
            <div>
              <strong>Phone:</strong> {latestOrder.number}
            </div>
            <div>
              <strong>City:</strong> {latestOrder.city}
            </div>
            <div className="md:col-span-2">
              <strong>Address:</strong> {latestOrder.address}
            </div>
            <div>
              <strong>PIN Code:</strong> {latestOrder.pinCode}
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Order Items</h3>
          <div className="space-y-4">
            {latestOrder.items?.reverse().map((item, index) => (
              <div
                key={item.product_id || index}
                className="flex items-center gap-4 rounded-xl border p-4"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">{item.color}</p>
                  <p className="text-gray-500">Qty: {item.quantity || 1}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900 line-through">
                      ₹{item.original_price}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {item.discount_percentage}% OFF
                    </span>
                  </div>
                </div>

                <p className="font-semibold text-gray-900">
                  ₹{Math.round(
                    item.original_price -
                    (item.original_price * item.discount_percentage) / 100
                  ).toLocaleString()}
                  {item.quantity > 1 && (
                    <span className="block text-sm text-gray-500">
                      (₹{Math.round(
                        (item.original_price - (item.original_price * item.discount_percentage) / 100) * 
                        (item.quantity || 1)
                      ).toLocaleString()} total)
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{latestOrder.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total:</span>
              <span>₹{latestOrder.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
