import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import api from '../services/api';
import toast from 'react-hot-toast';

function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!state || !state.checkoutDetails) {
    navigate('/checkOut');
    return null;
  }

  const { checkoutDetails, totalAmount, cartItems } = state;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create order object matching backend expectations
      const orderData = {
        ...checkoutDetails,
        items: cartItems,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
        status: "confirmed",
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        isPaid: true
      };

      // In a real app, we'd call a payment gateway API here (Stripe/Razorpay)
      // For now, we simulate success and update the user's order history
      
      const newOrders = [...(currentUser.order || []), orderData];
      
      // Update backend user data
      await api.patch(`/users/${currentUser.id}`, {
        order: newOrders,
        cart: [] // Clear the cart after successful order
      });
      
      // Update context and storage
      const updatedUser = { ...currentUser, order: newOrders, cart: [] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      clearCart(); // Clear local context cart
      
      toast.success("Payment Received! Order Placed Successfully.");
      navigate("/OrderPage"); // Or /orders

    } catch (err) {
      console.error("Order failed:", err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 mb-20 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* PAYMENT OPTIONS */}
        <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Payment</h1>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-emerald-50">✔</div>
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-indigo-50">2</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black text-gray-900 uppercase tracking-tighter">Credit / Debit Card</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pay with Visa, Mastercard, AMEX</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-indigo-600' : 'border-gray-200'}`}>
                            {paymentMethod === 'card' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                        </div>
                    </button>

                    <button 
                        onClick={() => setPaymentMethod('upi')}
                        className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${paymentMethod === 'upi' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black text-gray-900 uppercase tracking-tighter">UPI / Google Pay</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pay using your UPI ID</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-indigo-600' : 'border-gray-200'}`}>
                            {paymentMethod === 'upi' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                        </div>
                    </button>

                    {paymentMethod === 'card' && (
                        <div className="pt-6 space-y-4 animate-fadeIn">
                             <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Card Number</label>
                                    <input type="text" placeholder="•••• •••• •••• ••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Expiry Date</label>
                                        <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">CVV</label>
                                        <input type="password" placeholder="•••" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold" />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="pt-8">
                    <button 
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl uppercase tracking-tighter hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400"
                    >
                        {isProcessing ? 'Processing Securely...' : `Pay ₹${totalAmount} Now`}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-gray-400 grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-4" alt="visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="master" />
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>Verified & Encrypted</span>
                    </div>
                </div>
            </div>
        </div>

        {/* ORDER REVIEW */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit space-y-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter border-b border-gray-50 pb-4">Review Order</h2>
            
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100 leading-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping To</p>
                        <p className="text-sm font-bold text-gray-900">{checkoutDetails.address}</p>
                        <p className="text-xs font-bold text-gray-500">{checkoutDetails.city}, {checkoutDetails.pinCode}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100 leading-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                        <p className="text-sm font-bold text-gray-900">{checkoutDetails.name}</p>
                        <p className="text-xs font-bold text-gray-500">{checkoutDetails.number}</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span>Items Total</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span>Shipping</span>
                        <span className="text-emerald-500 underline">FREE</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-gray-900 uppercase tracking-tighter pt-4 border-t border-gray-100">
                        <span>Grand Total</span>
                        <span>₹{totalAmount}</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => navigate(-1)} 
                className="w-full text-xs font-bold text-gray-400 hover:text-indigo-600 transition uppercase tracking-widest text-center"
            >
                Edit Shipping Details
            </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
