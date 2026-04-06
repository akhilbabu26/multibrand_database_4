import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import orderService from "../../services/order.service";
import { unwrapData, getErrorMessage } from "../../lib/http";

function OrdersInfo() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderId, setOrderId] = useState("");
  const limit = 10;

  const load = useCallback(async (p = 1, s = "", sd = "", ed = "", oid = "") => {
    setLoading(true);
    try {
      const params = { 
        page: p, 
        limit,
        status: s || undefined,
        start_date: sd || undefined,
        end_date: ed || undefined,
        order_id: oid || undefined
      };
      const raw = await orderService.getAllOrders(params);
      const inner = unwrapData(raw) ?? raw;
      setOrders(inner?.orders ?? []);
      setTotal(inner?.total ?? 0);
      setPage(inner?.page ?? p);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        load(1, status, startDate, endDate, orderId);
    }, 400);
    return () => clearTimeout(timer);
  }, [load, status, startDate, endDate, orderId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Status updated");
      load(page, status, startDate, endDate, orderId);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Update failed");
    }
  };

  const adminCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await orderService.adminCancelOrder(orderId);
      toast.success("Order cancelled");
      load(page, status, startDate, endDate, orderId);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Cancel failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const nextStatuses = (current) => {
    const m = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return m[current] || [];
  };

  if (loading && !orders.length) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  const resetFilters = () => {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setOrderId("");
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order management</h1>
            <p className="text-gray-600">Update fulfillment status and track deliveries</p>
          </div>
          <button 
            onClick={resetFilters}
            className="text-sm font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition"
          >
            Clear all filters
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search by ID</label>
                <input 
                    type="text"
                    placeholder="Order ID..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</label>
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From Date</label>
                <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To Date</label>
                <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-100/50 border-b border-gray-200">
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide">
              Order
            </div>
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide">
              Ship to
            </div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Items
            </div>
            <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Amount
            </div>
            <div className="col-span-3 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">
              Actions
            </div>
          </div>

          <div className="divide-y divide-gray-200/60">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-gray-50/30 italic">
                No orders found matching your filters
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50"
                >
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : ""}
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}
                     Valencian
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm">
                    <p className="font-medium">{order.address?.full_name}</p>
                    <p className="text-gray-500">{order.address?.phone}</p>
                    <p className="text-gray-500 truncate">
                      {order.address?.city}, {order.address?.state}
                    </p>
                  </div>
                  <div className="col-span-2 text-center text-sm">
                    {(order.items || []).length} items
                  </div>
                  <div className="col-span-2 text-center font-bold">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </div>
                  <div className="col-span-3 flex flex-col gap-2 items-center">
                    {nextStatuses(order.status).length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          e.target.value = "";
                          if (v) updateOrderStatus(order.id, v);
                        }}
                        className="w-full max-w-[200px] px-2 py-1 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Update Status…</option>
                        {nextStatuses(order.status).map((s) => (
                          <option key={s} value={s}>
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                    {order.status !== "cancelled" &&
                      order.status !== "delivered" && (
                        <button
                          type="button"
                          onClick={() => adminCancel(order.id)}
                          className="text-red-500 text-[10px] uppercase font-black hover:underline tracking-widest"
                        >
                          Force Cancel
                        </button>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:hidden divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">#{order.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.address?.full_name}</p>
                <p className="font-bold">₹{Number(order.total_amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {total > limit && (
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => load(page - 1, status, startDate, endDate, orderId)}
              className="px-6 py-2 border-2 border-gray-100 rounded-xl disabled:opacity-40 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              type="button"
              disabled={page * limit >= total}
              onClick={() => load(page + 1, status, startDate, endDate, orderId)}
              className="px-6 py-2 border-2 border-gray-100 rounded-xl disabled:opacity-40 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersInfo;
