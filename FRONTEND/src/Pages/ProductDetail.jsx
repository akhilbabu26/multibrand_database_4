import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { api } from "../api/Api";
import Navbar from "../components/layout/Navbar/Navbar";
import toast from 'react-hot-toast';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: products, loading } = useFetch("/products");
  const { currentUser } = useContext(AuthContext);
  const { cart, setCart } = useContext(CartContext);
  
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const product = products?.find(p => p.product_id === productId);

  useEffect(() => {
    if (currentUser?.wishlist) {
      setIsWishlisted(currentUser.wishlist.some(item => item.product_id === productId));
    }
  }, [currentUser, productId]);

  const isInCart = cart.some(item => item.product_id === productId);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div>
        {/* <Navbar /> */}
        <div className="max-w-7xl mx-auto p-4 text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if product not found
  if (!product) {
    return (
      <div>
        {/* <Navbar /> */}
        <div className="max-w-7xl mx-auto p-4 text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <button onClick={() => navigate("/")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Safe calculations after product is confirmed to exist
  const salePrice = Math.round(product.original_price - (product.original_price * product.discount_percentage) / 100);

  const addToCart = () => {
    if (!currentUser) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize && product?.sizes?.length > 0) {
      toast.error("Please select a size first");
      return;
    }

    if (isInCart) {
      navigate("/cart"); // Navigate to cart if already in cart
      return;
    }

    const productWithDetails = { ...product, quantity, size: selectedSize };
    setCart(prev => [...prev, productWithDetails]);
    toast.success("Product added to cart!");
  };

  const buyNow = () => {
    if (!currentUser) {
      toast.error("Please login to buy items");
      navigate("/login");
      return;
    }

    if (!selectedSize && product?.sizes?.length > 0) {
      toast.error("Please select a size first");
      return;
    }

    if (!isInCart) {
      const productWithDetails = { ...product, quantity, size: selectedSize };
      setCart(prev => [...prev, productWithDetails]);
    }
    
    // Redirect instantly to checkout
    navigate("/checkOut");
  };

  const toggleWishlist = async () => {
    if (!currentUser) {
      toast.error("Please login to manage wishlist");
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const oldWishlist = user.wishlist || [];
      const exists = oldWishlist.some(item => item.product_id === productId);

      const newWishlist = exists
        ? oldWishlist.filter(item => item.product_id !== productId)
        : [...oldWishlist, product];

        if(!exists)toast.success(`Added to Wishlist 💖`)
        if(exists)toast.error(`Removed to Wishlist 💖`)

      const updated = await api.patch(`/users/${user.id}`, { wishlist: newWishlist });
      localStorage.setItem("user", JSON.stringify(updated.data));
      setIsWishlisted(!exists);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* <Navbar /> */}
      
      <div className="max-w-7xl mx-auto p-4">
        <nav className="flex mb-6 text-sm">
          <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-700">Home</button>
          <span className="mx-2 text-gray-400">/</span>
          <button onClick={() => navigate(`/allshoe/${product.type}`)} className="text-gray-500 hover:text-gray-700">{product.type}</button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img src={product.image_url} alt={product.name} className="w-full rounded-lg bg-gray-100" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                {product.gender && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {product.gender}
                  </span>
                )}
                {product.category && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-gray-600">{product.color}</p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold">₹{salePrice}</p>
              <p className="text-xl line-through text-gray-500">₹{product.original_price}</p>
              <p className="text-lg text-emerald-600 font-semibold">{product.discount_percentage}% OFF</p>
            </div>

            <p className="text-gray-600">{product.description || "Premium quality product with excellent craftsmanship and design."}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Select Size</span>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">Size Guide</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-medium rounded-lg border flex items-center justify-center transition-all ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 mt-6">
              <label className="font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex border border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-4 py-2 hover:bg-gray-100">-</button>
                  <span className="px-4 py-2 bg-white min-w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(prev => prev + 1)} className="px-4 py-2 hover:bg-gray-100">+</button>
                </div>
                <span className="text-sm text-gray-500">Total: ₹{quantity * salePrice}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <div className="flex gap-4">
                <button onClick={addToCart} className="flex-1 border-2 border-black bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                  {isInCart ? "View in Cart" : "Add to Cart"}
                </button>
                
                <button onClick={toggleWishlist} className="px-6 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <svg className={`w-5 h-5 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-400"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <button onClick={buyNow} className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 shadow-md transition transform hover:scale-[1.01]">
                Buy Now
              </button>
            </div>

            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <div>Free shipping on orders over ₹5000</div>
              <div>30-day return policy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;