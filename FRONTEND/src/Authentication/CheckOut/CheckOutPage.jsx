import React, { useContext, useState } from "react";
import { Formik, Field, Form } from "formik";
import { CheckoutValidation } from "./CheckValidation";
import { AuthContext } from "../../Context/AuthContext";
import { useCart } from "../../hooks/useCart";
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
  const { currentUser } = useContext(AuthContext);
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleProceedToPayment = (values) => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Instead of placing order, we pass data to PaymentPage
    navigate("/payment", { 
      state: { 
        checkoutDetails: values,
        cartItems: cart,
        totalAmount: cartTotal 
      } 
    });
    
    toast.success("Details saved! Proceeding to payment...");
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl mt-10 shadow-sm border border-gray-100">
        <div className="mb-6 text-6xl">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 font-medium">Add some shoes to your cart before checking out!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 mb-20 mt-10 bg-white rounded-3xl shadow-xl border border-gray-50">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Shipping Details</h1>
        <div className="flex gap-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-indigo-50">1</div>
            <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold text-xs">2</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <div className="lg:col-span-2">
            <Formik
            initialValues={checkValues}
            validationSchema={CheckoutValidation}
            onSubmit={handleProceedToPayment}
            >
            {({ errors, touched, isValid, dirty }) => (
                <Form className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <Field
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold"
                    />
                    {errors.name && touched.name && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.name}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                        <Field
                        type="tel"
                        name="number"
                        placeholder="10-digit number"
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold"
                        />
                        {errors.number && touched.number && (
                        <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.number}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                        <Field
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold"
                        />
                        {errors.email && touched.email && (
                        <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Address</label>
                    <Field
                    component="textarea"
                    name="address"
                    placeholder="Street name, house number, etc."
                    rows="3"
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold resize-none"
                    />
                    {errors.address && touched.address && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.address}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                        <Field
                        type="text"
                        name="city"
                        placeholder="City"
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold"
                        />
                        {errors.city && touched.city && (
                        <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.city}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">PIN Code</label>
                        <Field
                        type="text"
                        name="pinCode"
                        placeholder="6-digit PIN"
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none font-bold"
                        />
                        {errors.pinCode && touched.pinCode && (
                        <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.pinCode}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || !dirty}
                    className="w-full bg-black text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition transform active:scale-95 shadow-xl disabled:bg-gray-200 disabled:transform-none disabled:shadow-none mt-4"
                >
                    Proceed to Payment →
                </button>
                </Form>
            )}
            </Formik>
        </div>

        {/* SUMMARY SECTION */}
        <div className="bg-gray-50 rounded-3xl p-6 h-fit border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b border-gray-200">Order Summary</h3>
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map(item => (
                    <div key={item.product_id || item.id} className="flex gap-3">
                        <img src={item.images?.[0]?.image_url || item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-white shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Size: {item.selectedSize || item.size} • Qty: {item.quantity}</p>
                            <p className="text-xs font-black text-gray-900 mt-1">₹{item.sale_price || item.original_price}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-emerald-600 underline">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-black text-gray-900 uppercase tracking-tighter pt-3 border-t border-gray-100">
                    <span>Order Total</span>
                    <span>₹{cartTotal}</span>
                </div>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[10px] font-bold text-indigo-700 leading-tight">Secured and Encrypted Checkout Experience</p>
            </div>
        </div>
      </div>

      <button
          className="mt-8 text-xs font-bold text-gray-400 hover:text-gray-900 transition flex items-center gap-2 uppercase tracking-widest"
          onClick={() => navigate(-1)}
      >
          ← Go Back
      </button>
    </div>
  );
}

export default CheckOutPage;
