import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import orderService from "../services/order.service";
import { getErrorMessage } from "../lib/http";

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const inner = await orderService.getMyOrders({ page: p, limit });
      setOrders(inner?.orders ?? []);
      setTotal(inner?.total ?? 0);
      setPage(inner?.page ?? p);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Order cancelled");
      load(page);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not cancel");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !orders.length) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No orders yet</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="font-medium">
                  Total: ₹{Number(order.total_amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.payment_method} · {order.payment_status}
                </p>
              </div>

              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-12 rounded object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      ₹{Number(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {(order.status === "pending" || order.status === "confirmed") && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => cancelOrder(order.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel order
                  </button>
                </div>
              )}
            </div>
          ))}

          {total > limit && (
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <span className="py-2 text-sm text-gray-600">
                Page {page} · {total} orders
              </span>
              <button
                type="button"
                disabled={page * limit >= total}
                onClick={() => load(page + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="flex items-center mt-6 gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
}

export default OrdersPage;
