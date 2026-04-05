import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../Hooks/useFetch";
import { useAuth } from "../Hooks/useAuth";
import { useCart } from "../Hooks/useCart";
import { useWishlist } from "../Hooks/useWishlist";

export default function ProductDetail() {
  const { productId } = useParams();
  return <ProductDetailInner key={productId} productId={productId} />;
}

function ProductDetailInner({ productId }) {
  const navigate = useNavigate();
  const { data: product, loading } = useFetch(`/products/${productId}`, null, {
    asEntity: true,
  });
  const { currentUser } = useAuth();
  const { cart, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [sizeOverride, setSizeOverride] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const pid = product?.id;

  const defaultImage =
    product &&
    (product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      product.image_url);
  const mainImage = pickedImage ?? defaultImage ?? null;

  const selectedSize = sizeOverride ?? String(product?.size || "40");

  const isAddedToCart = cart.some(
    (item) => String(item.product_id) === String(pid)
  );
  const isWishListed = isInWishlist(pid);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!product || !pid) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center py-24 bg-white rounded-3xl mt-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">
          Product not found
        </h2>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-black text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition"
        >
          Return to collection
        </button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (isAddedToCart) {
      navigate("/cart");
      return;
    }
    const ok = await addToCart(product, quantity);
    if (!ok && !currentUser) navigate("/login");
  };

  const sizes = ["38", "39", "40", "41", "42", "43", "44"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 mb-20 bg-white min-h-screen">
      <nav className="flex mb-12 text-[10px] font-black uppercase tracking-widest bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-indigo-600 transition"
        >
          Shop
        </button>
        <span className="mx-3 text-gray-300">/</span>
        <button
          type="button"
          onClick={() => navigate(`/allshoe/${encodeURIComponent(product.type)}`)}
          className="text-gray-400 hover:text-indigo-600 transition"
        >
          {product.type}
        </button>
        <span className="mx-3 text-gray-300">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-[32px] shadow-2xl bg-gray-50">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full aspect-square object-cover transition duration-700 ease-in-out transform group-hover:scale-105"
            />
            {product.discount_percentage > 0 && (
              <span className="absolute top-8 left-8 bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter shadow-xl">
                -{product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
              {product.images.map((img, idx) => (
                <button
                  type="button"
                  key={img.id || idx}
                  onClick={() => setPickedImage(img.image_url)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl border-4 transition transform hover:scale-105 active:scale-95 overflow-hidden shadow-sm ${
                    mainImage === img.image_url
                      ? "border-black ring-4 ring-gray-100"
                      : "border-white hover:border-gray-100"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`${product.name} ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col py-4">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.gender}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.type}
              </span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 leading-[1.1] mb-4 tracking-tighter">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                <span
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100"
                  style={{ backgroundColor: product.color }}
                />
                <span>{product.color}</span>
              </div>
              <span className="text-gray-200">|</span>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                {product.stock > 0
                  ? `In stock (${product.stock})`
                  : "Sold out"}
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-4 mb-12">
            <p className="text-5xl font-black text-gray-900 tracking-tighter">
              ₹{product.sale_price}
            </p>
            <p className="text-2xl line-through text-gray-300 font-bold">
              ₹{product.original_price}
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-center mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Select size (EU)
                </label>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSizeOverride(size)}
                    disabled={product.stock === 0}
                    className={`h-14 flex items-center justify-center text-sm font-black rounded-2xl border-2 transition transform active:scale-95 ${
                      selectedSize === size
                        ? "bg-black text-white border-black shadow-lg shadow-gray-200"
                        : "bg-white text-gray-900 border-gray-50 hover:border-gray-900"
                    } ${
                      product.stock === 0
                        ? "opacity-30 cursor-not-allowed grayscale"
                        : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
                Description
              </label>
              <p className="text-gray-600 leading-relaxed font-medium">
                {product.description ||
                  "Premium footwear crafted for comfort and style."}
              </p>
            </div>

            <div className="flex items-center gap-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Quantity
              </label>
              <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-white shadow-sm h-14 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-14 h-full flex items-center justify-center hover:bg-gray-50 transition text-xl font-black"
                >
                  −
                </button>
                <span className="w-14 h-full flex items-center justify-center bg-white font-black text-lg">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-14 h-full flex items-center justify-center hover:bg-gray-50 transition text-xl font-black"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-black text-white h-20 rounded-3xl font-black text-xl uppercase tracking-tighter hover:bg-gray-800 transition transform active:scale-95 shadow-2xl shadow-gray-200 disabled:bg-gray-400 disabled:transform-none disabled:shadow-none"
              >
                {product.stock === 0
                  ? "OUT OF STOCK"
                  : isAddedToCart
                    ? "VIEW IN CART"
                    : "ADD TO CART"}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`w-20 h-20 border-2 rounded-3xl transition transform active:scale-95 flex items-center justify-center ${
                  isWishListed
                    ? "border-red-50 bg-red-50 text-red-500 shadow-xl shadow-red-50"
                    : "border-gray-50 text-gray-300 hover:border-gray-200 bg-white"
                }`}
              >
                <svg
                  className={`w-8 h-8 ${isWishListed ? "fill-current" : ""}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
