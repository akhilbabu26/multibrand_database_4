import { useCart } from "../Hooks/useCart";
import { useWishlist } from "../Hooks/useWishlist";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart, cart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  // These two lines need updating since backend uses product_id in cart/wishlist items
  const isAddedToCart = cart.some(item => item.product_id === product.id)
  const isWishListed = isInWishlist(product.id)

  
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

  // Backend returns images[] with is_primary flag
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url
    || product.images?.[0]?.image_url
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
            className="w-full h-64 object-cover transform transition group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md">
            <span className="text-gray-400 text-sm">No image</span>
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
        <h3 className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition truncate">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">
          {product.gender} • {product.color}
        </p>

        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className="text-sm line-through text-gray-400">
            ₹{product.original_price}
          </span>
          {product.discount_percentage > 0 && (
            <span className="text-sm text-emerald-500 font-bold">
              {product.discount_percentage}% OFF
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            ₹{product.sale_price}
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