import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import paymentService from "../services/payment.service";
import toast from "react-hot-toast";
import { unwrapData, getErrorMessage } from "../lib/http";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [session, setSession] = useState(null);

  const orderId = state?.orderId;

  useEffect(() => {
    if (!orderId) {
      navigate("/checkOut", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const raw = await paymentService.createPayment(orderId);
        const data = unwrapData(raw) ?? raw;
        if (!cancelled) setSession(data);
      } catch (e) {
        toast.error(getErrorMessage(e) || "Could not start payment");
        navigate("/orders", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, navigate]);

  const startPay = async () => {
    if (!session?.razorpay_order_id || !session?.key_id) {
      toast.error("Payment session not ready");
      return;
    }
    setPaying(true);
    try {
      const Razorpay = await loadRazorpayScript();
      const amountPaise = Math.round(Number(session.amount) * 100);

      const options = {
        key: session.key_id,
        amount: amountPaise,
        currency: session.currency || "INR",
        order_id: session.razorpay_order_id,
        name: "Multibrand",
        description: `Order #${orderId}`,
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        },
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            navigate("/orderPage", { state: { lastOrderId: orderId } });
          } catch (e) {
            toast.error(getErrorMessage(e) || "Verification failed");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not open checkout");
      setPaying(false);
    }
  };

  if (!orderId) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-8 mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Complete payment</h1>
      <p className="text-gray-600 mb-6">
        Order #{orderId} · ₹{Number(session?.amount ?? 0).toFixed(2)}
      </p>
      <button
        type="button"
        disabled={paying}
        onClick={startPay}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {paying ? "Opening…" : "Pay with Razorpay"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="w-full mt-4 text-sm text-gray-500 hover:text-gray-800"
      >
        Pay later / view orders
      </button>
    </div>
  );
}

export default PaymentPage;
