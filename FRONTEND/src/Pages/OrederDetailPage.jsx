import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/Api";
import toast from 'react-hot-toast';

function OrdersPage() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const orders = currentUser?.order || [];

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      // Update the order status to 'cancelled' instead of removing it
      const updatedOrders = currentUser.order.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      );

      await api.patch(`/users/${currentUser.id}`, { order: updatedOrders });

      // Update local storage and context
      const updatedUser = { ...currentUser, order: updatedOrders };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast.success("Order cancelled successfully!")
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No orders found</p>
            <button 
              onClick={() => navigate("/")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.orderId}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-medium">Total: ₹{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{order.items?.length} items</p>
                </div>

                <div className="space-y-3">
                  {order.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹{Math.round(item.original_price - (item.original_price * item.discount_percentage) / 100)}
                      </p>
                    </div>
                  ))}
                </div>

                {order.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t">
                    <button 
                      onClick={() => cancelOrder(order.orderId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


               
        <button
          className="flex items-center mt-3 gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => navigate(-1)}
         >
          BACK
        </button>

      </div>
    </div>
  );
}

export default OrdersPage;