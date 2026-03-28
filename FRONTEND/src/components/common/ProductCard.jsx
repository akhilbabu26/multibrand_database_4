import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { WishlistContext } from "../../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cart, setCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [added, setAdded] = useState(false);

  // Check if product is in cart
  useEffect(() => {
    setAdded(cart.some(item => item.product_id === product.product_id));
  }, [cart, product.product_id]);

  const isWishListed = isInWishlist(product.product_id);

  // detail page
  const goToDetail = () => navigate(`/product/${product.product_id}`);
  
  const addToCart = (e) => {
    e?.stopPropagation(); // Prevent navigation
    
    if (added) {
      navigate("/cart");
      return;
    }

    if (!currentUser) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const productWithQuantity = { ...product, quantity: 1 };
    setCart(prev => [...prev, productWithQuantity]);
    setAdded(true);
    toast.success("Added to Cart 🛒");
  };

  const handleToggleWishlist = (e) => {
    e?.stopPropagation(); // Prevent navigation
    toggleWishlist(product);
  };

  const salePrice = Math.round(
    product.original_price - (product.original_price * product.discount_percentage) / 100
  );

  return (
    <div className="group bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition border cursor-pointer relative"
         onClick={goToDetail}>
      
      <div className="relative">
        <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover rounded-md bg-gray-200 group-hover:opacity-90 transition" />
        
        <button 
          onClick={handleToggleWishlist} 
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
        >
          <svg className={`h-5 w-5 ${isWishListed ? "text-red-500 fill-current" : "text-gray-400"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-sm text-gray-500">{product.color}</p>
          {product.gender && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
              {product.gender}
            </span>
          )}
          {product.category && (
            <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded">
              {product.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-2 flex-wrap">
          <span className="text-sm line-through text-gray-400">₹{product.original_price}</span>
          <span className="text-sm text-emerald-400 font-bold">{product.discount_percentage}% OFF</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">₹{salePrice}</span>
          <button 
            onClick={addToCart} 
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
          >
            {added ? "Go to cart 🛒" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
