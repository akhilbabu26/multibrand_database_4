import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Hooks/useCart";
function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();

  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="text-gray-400 mb-4">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition transform active:scale-95 shadow-md"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 mb-8 text-gray-400 hover:text-indigo-600 transition group"
      >
        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Continue Shopping</span>
      </button>

      <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((product) => {
            const unit = Number(product.salePrice ?? 0);
            const lineTotal = Number(product.subtotal || 0);

            return (
                <div
                  key={product.productId}
                  className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 border border-gray-100 hover:shadow-md transition"
                >
                  <img
                    alt={product.name}
                    src={product.imageUrl}
                    onClick={() => navigate(`/product/${product.productId}`, { state: { from: 'Cart' } })}
                    className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg bg-gray-50 cursor-pointer hover:opacity-80 transition"
                  />
    
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div 
                          onClick={() => navigate(`/product/${product.productId}`, { state: { from: 'Cart' } })}
                          className="cursor-pointer group"
                        >
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">{product.name}</h3>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                             {product.brand} | Size {product.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.productId)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-gray-900">₹{unit}</span>
                        <span className="text-sm text-gray-500">each</span>
                      </div>
                    </div>
    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                        <button
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition font-bold"
                          onClick={() => updateQuantity(product.productId, (product.quantity || 1) - 1)}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 font-semibold text-gray-900 min-w-[40px] text-center">
                          {product.quantity || 1}
                        </span>
                        <button
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition font-bold"
                          onClick={() => updateQuantity(product.productId, (product.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <p className="text-lg font-bold text-gray-900">
                        ₹{lineTotal.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
          })}
        </div>

        {/* SUMMARY SECTION */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-500 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-indigo-600">₹{cartTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkOut")}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 transform active:scale-95 mb-4"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white text-gray-600 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
