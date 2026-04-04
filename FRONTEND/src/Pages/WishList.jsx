import React from "react";
import { useWishlist } from "../Hooks/useWishlist";
import { useCart } from "../Hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";

function WishList() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.product_id);
  };

  const calculateSalePrice = (product) => {
    return Math.round(
      product.original_price -
      (product.original_price * product.discount_percentage) / 100
    );
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save items you love for later!</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.product_id}
              className="group relative bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border"
            >
              <div className="relative">
                <img
                  alt={product.name}
                  src={product.image_url}
                  className="w-full h-64 object-cover rounded-md bg-gray-200 group-hover:opacity-90 transition"
                />
                <button
                  onClick={() => removeFromWishlist(product.product_id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 hover:text-red-600 transition"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{product.color}</p>

                <div className="flex items-center space-x-2 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-400 line-through">
                    ₹{product.original_price}
                  </span>
                  <span className="text-sm font-bold text-emerald-500">
                    {product.discount_percentage}% OFF
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{calculateSalePrice(product)}
                  </span>
                  
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition transform active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlist.length > 4 && (
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Top
          </button>
        </div>
      )}
    </div>
  );
}

export default WishList;
