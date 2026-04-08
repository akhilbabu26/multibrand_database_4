import { useCart } from "../Hooks/useCart";
import { useWishlist } from "../Hooks/useWishlist";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart, cart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  // These two lines need updating since backend uses product_id in cart/wishlist items
  // Use backend flags as primary source for initial load, then fallback to context checks
  const isAddedToCart = product?.isCart || cart.some(item => item.productId === product?.id)
  const isWishListed = product?.isWishlist || isInWishlist(product?.id)

  
  const goToDetail = () => navigate(`/product/${product.id}`)

  const handleAddToCart = (e) => {
    e?.stopPropagation()
    if (isAddedToCart) {
      navigate("/cart")
      return
    }
    const success = addToCart(product)
    if (!success) navigate("/login")
  }

  const handleToggleWishlist = (e) => {
    e?.stopPropagation()
    toggleWishlist(product)
  }

  // Backend returns images[] with isPrimary flag
  // Fallback to legacy imageUrl if provided, then to first image, then null
  const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl
    || product.images?.[0]?.imageUrl
    || product.imageUrl
    || null

  return (
    <div
      className="group bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition cursor-pointer"
      onClick={goToDetail}
    >
      <div className="relative overflow-hidden rounded-md">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-48 sm:h-64 object-cover transform transition group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gray-50 flex flex-col items-center justify-center rounded-md border border-gray-100 italic text-gray-300">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] uppercase tracking-widest font-black">No Preview</span>
          </div>
        )}

        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition"
        >
          <svg
            className={`h-5 w-5 ${isWishListed ? "text-red-500 fill-current" : "text-gray-400"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
            {product.name}
          </h3>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0">
            {product.brand}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-widest font-black">
          {product.gender} • {product.color} • {product.type}
        </p>

        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className="text-sm line-through text-gray-400">
            ₹{product.originalPrice}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-sm text-emerald-500 font-bold">
              {product.discountPercentage}% OFF
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            ₹{product.salePrice}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-black text-white px-3 py-2 rounded mt-3 w-full hover:bg-gray-800 transition transform active:scale-95 text-sm uppercase tracking-widest font-bold"
        >
          {isAddedToCart ? "🏃‍♂️ Go to cart" : "Add to cart 🛒"}
        </button>
      </div>
    </div>
  )
}