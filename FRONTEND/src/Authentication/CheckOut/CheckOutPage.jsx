import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useCart } from "../../Hooks/useCart";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import addressService from "../../services/address.service";
import orderService from "../../services/order.service";
import { PAYMENT_METHOD } from "../../constants/apiConstants";
import { getErrorMessage } from "../../lib/http";

const addressSchema = Yup.object({
  fullName: Yup.string().min(2).required("Required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "10-digit Indian mobile")
    .required("Required"),
  street: Yup.string().required("Required"),
  landmark: Yup.string(),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  pinCode: Yup.string()
    .matches(/^\d{6}$/, "6-digit PIN")
    .required("Required"),
});

const emptyAddress = {
  fullName: "",
  phone: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  isDefault: false,
};

function CheckOutPage() {
  const { cart, cartTotal, fetchCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.COD);
  const [submitting, setSubmitting] = useState(false);

  const buyNowItem = state?.buyNowItem;
  const isBuyNow = !!buyNowItem;

  const displayItems = isBuyNow ? [buyNowItem] : cart;
  const displayTotal = isBuyNow 
    ? (buyNowItem.salePrice * buyNowItem.quantity) 
    : cartTotal;

  const loadAddresses = useCallback(async () => {
    setLoadingAddr(true);
    try {
      const list = await addressService.getAddresses();
      const arr = Array.isArray(list) ? list : [];
      setAddresses(arr);
      setSelectedId((prev) => {
        if (prev && arr.some((a) => a.id === prev)) return prev;
        const def = arr.find((a) => a.isDefault);
        return def?.id ?? arr[0]?.id ?? null;
      });
      if (!arr.length) setShowNew(true);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not load addresses");
      setAddresses([]);
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = async (values, { resetForm }) => {
    try {
      // Map camelCase form values to snake_case for backend
      await addressService.createAddress({
        full_name: values.fullName,
        phone: values.phone,
        street: values.street,
        landmark: values.landmark || "",
        city: values.city,
        state: values.state,
        pin_code: values.pinCode,
        is_default: values.isDefault,
      });
      toast.success("Address saved");
      resetForm();
      setShowNew(false);
      await loadAddresses();
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not save address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!displayItems?.length) {
      toast.error("Process is empty");
      return;
    }
    if (!selectedId) {
      toast.error("Select or add a delivery address");
      return;
    }
    setSubmitting(true);
    try {
      let payload;
      if (isBuyNow) {
        payload = await orderService.buyNow(
          buyNowItem.productId,
          buyNowItem.quantity,
          selectedId,
          paymentMethod
        );
      } else {
        payload = await orderService.placeOrder(selectedId, paymentMethod);
      }
      
      const order = payload?.order ?? payload;
      if (!isBuyNow) await fetchCart();

      if (paymentMethod === PAYMENT_METHOD.RAZORPAY) {
        navigate("/payment", {
          state: {
            orderId: order?.id,
            paymentHint: payload?.payment,
          },
        });
        return;
      }

      toast.success("Order placed successfully");
      navigate("/orderPage", { state: { lastOrderId: order?.id } });
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading || loadingAddr) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isBuyNow && !cart?.length) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl mt-10 shadow-sm border border-gray-100">
        <div className="mb-6 text-6xl">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          Add items before checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition"
        >
          Explore collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 mb-20 mt-6 min-h-screen">
      <button
        onClick={() => navigate(isBuyNow ? -1 : "/cart")}
        className="flex items-center gap-2 mb-8 text-gray-400 hover:text-indigo-600 transition group"
      >
        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          {isBuyNow ? "Back to Product" : "Return to Cart"}
        </span>
      </button>

      <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Delivery address</h2>
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="text-sm font-bold text-indigo-600 hover:underline"
              >
                {showNew ? "Choose saved" : "Add new"}
              </button>
            </div>

            {!showNew && addresses.length > 0 && (
              <ul className="space-y-3">
                {addresses.map((a) => (
                  <li key={a.id}>
                    <label className="flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition hover:border-indigo-100 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/30">
                      <input
                        type="radio"
                        name="addr"
                        checked={selectedId === a.id}
                        onChange={() => setSelectedId(a.id)}
                        className="mt-1.5 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{a.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {a.street}
                          {a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state}{" "}
                          {a.pinCode}
                        </p>
                        <p className="text-sm text-gray-500">{a.phone}</p>
                        {a.isDefault && (
                          <span className="text-xs font-bold text-indigo-600">Default</span>
                        )}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {showNew && (
              <Formik
                initialValues={emptyAddress}
                validationSchema={addressSchema}
                onSubmit={handleAddAddress}
              >
                {({ errors, touched }) => (
                  <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Full name
                      </label>
                      <Field
                        name="fullName"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.fullName && touched.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Phone
                      </label>
                      <Field
                        name="phone"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.phone && touched.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        PIN code
                      </label>
                      <Field
                        name="pinCode"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.pinCode && touched.pinCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Street
                      </label>
                      <Field
                        name="street"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.street && touched.street && (
                        <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Landmark (optional)
                      </label>
                      <Field
                        name="landmark"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        City
                      </label>
                      <Field
                        name="city"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.city && touched.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        State
                      </label>
                      <Field
                        name="state"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200"
                      />
                      {errors.state && touched.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Field type="checkbox" name="isDefault" className="rounded" />
                      <span className="text-sm text-gray-700">Set as default address</span>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800"
                      >
                        Save address
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === PAYMENT_METHOD.COD}
                  onChange={() => setPaymentMethod(PAYMENT_METHOD.COD)}
                />
                <div>
                  <p className="font-semibold">Cash on delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive the order</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === PAYMENT_METHOD.RAZORPAY}
                  onChange={() => setPaymentMethod(PAYMENT_METHOD.RAZORPAY)}
                />
                <div>
                  <p className="font-semibold">Razorpay</p>
                  <p className="text-sm text-gray-500">UPI, cards, netbanking</p>
                </div>
              </label>
            </div>
          </section>

          <button
            type="button"
            disabled={submitting || !selectedId}
            onClick={handlePlaceOrder}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-wide hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>

        <aside className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">{isBuyNow ? "Direct Order" : "Summary"}</h3>
          <ul className="space-y-3 text-sm max-h-64 overflow-y-auto mb-4">
            {displayItems.map((item) => (
              <li key={item.id ?? item.productId} className="flex justify-between gap-4 group">
                <span 
                  onClick={() => navigate(`/product/${item.productId}`)}
                  className="text-gray-700 truncate cursor-pointer group-hover:text-indigo-600 transition"
                  title="View details"
                >
                  {item.name}
                </span>
                <span className="font-medium shrink-0 text-gray-400">×{item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4 flex justify-between font-black text-lg">
            <span>Total</span>
            <span>₹{Number(displayTotal).toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckOutPage;
