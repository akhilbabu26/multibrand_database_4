import { CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import orderService from "../services/order.service";
import toast from "react-hot-toast";
import { unwrapData, getErrorMessage } from "../lib/http";

export default function OrderPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const lastOrderId = location.state?.lastOrderId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lastOrderId) {
        setLoading(false);
        return;
      }
      try {
        const raw = await orderService.getOrder(lastOrderId);
        const data = unwrapData(raw) ?? raw;
        if (!cancelled) setOrder(data);
      } catch (e) {
        toast.error(getErrorMessage(e) || "Could not load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lastOrderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900">No order to display</h1>
          <p className="mt-2 text-gray-600">
            Complete a purchase or open this page from your order confirmation.
          </p>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-8 bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-500"
          >
            My orders
          </button>
        </div>
      </div>
    );
  }

  const addr = order.address || {};

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Order received
          </h1>
          <p className="mt-2 text-gray-600">
            Thank you. We will keep you updated on the status.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 text-left md:text-center">
            <div>
              <strong>Order ID:</strong> {order.id}
            </div>
            <div>
              <strong>Placed:</strong>{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : "—"}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {order.status}
              </span>
            </div>
            <div>
              <strong>Payment:</strong> {order.payment_method} ({order.payment_status})
            </div>
            <div className="md:col-span-2">
              <strong>Total:</strong> ₹{Number(order.total_amount).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Shipping address</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{addr.full_name}</p>
            <p>{addr.phone}</p>
            <p>
              {addr.street}
              {addr.landmark ? `, ${addr.landmark}` : ""}
            </p>
            <p>
              {addr.city}, {addr.state} {addr.pin_code}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">Items</h3>
          <div className="space-y-4">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border p-4"
              >
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium mt-1">
                    ₹{Number(item.price).toFixed(2)} each · line ₹
                    {Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}
