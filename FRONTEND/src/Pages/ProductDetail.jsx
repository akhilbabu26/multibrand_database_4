import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate('/');
  };

  const { data: product, loading } = useFetch(`/products/${productId}`, null, {
    asEntity: true,
  });
  const { currentUser } = useAuth();
  const { cart, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const { data: variantsResponse } = useFetch(`/products/${productId}/variants`, null);
  const variants = variantsResponse || [];

  const [pickedImage, setPickedImage] = useState(null);

  const pid = product?.id;

  const defaultImage =
    product &&
    (product.images?.find((img) => img.isPrimary)?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      product.imageUrl);
  const mainImage = pickedImage ?? defaultImage ?? null;

  // The size of the current product variant
  const currentProductSize = String(product?.size || "");

  // Status calculations moved after loading/null checks to avoid TypeError

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

  // Moved calculations here after null/loading checks
  const isAddedToCart = product.isCart || cart.some(
    (item) => String(item.productId) === String(pid)
  );
  const isWishListed = product.isWishlist || isInWishlist(pid);

  const handleAddToCart = async () => {
    if (isAddedToCart) {
      navigate("/cart");
      return;
    }
    const ok = await addToCart(product, quantity);
    if (!ok && !currentUser) navigate("/login");
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: `/product/${productId}` } });
      return;
    }

    navigate("/checkOut", { 
      state: { 
        buyNowItem: {
          productId: pid,
          name: product.name,
          imageUrl: mainImage,
          salePrice: product.salePrice,
          brand: product.brand,
          size: product.size,
          quantity: quantity
        }
      } 
    });
  };

  const sizes = ["38", "39", "40", "41", "42", "43", "44"];

  // Map of available sizes to their product objects
  const sizeMap = variants.reduce((acc, v) => {
    acc[String(v.size)] = v;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 mb-20 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition group"
        >
          <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {location.state?.from ? `Back to ${location.state.from}` : "Back to Collection"}
          </span>
        </button>
      </div>

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
          onClick={() => navigate(`/allshoe/${encodeURIComponent(product.brand)}`)}
          className="text-gray-400 hover:text-indigo-600 transition"
        >
          {product.brand}
        </button>
        <span className="mx-3 text-gray-300">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-6">
          <div className="group relative overflow-hidden rounded-[32px] shadow-2xl bg-gray-50">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full aspect-square object-cover transition duration-700 ease-in-out transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-50 flex flex-col items-center justify-center italic text-gray-200">
                <svg className="w-24 h-24 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs uppercase tracking-widest font-black">No product overview</span>
              </div>
            )}
            {product.discountPercentage > 0 && (
              <span className="absolute top-8 left-8 bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter shadow-xl">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
              {product.images.map((img, idx) => (
                <button
                  type="button"
                  key={img.id || idx}
                  onClick={() => setPickedImage(img.imageUrl)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl border-4 transition transform hover:scale-105 active:scale-95 overflow-hidden shadow-sm ${
                    mainImage === img.imageUrl
                      ? "border-black ring-4 ring-gray-100"
                      : "border-white hover:border-gray-100"
                  }`}
                >
                  <img
                    src={img.imageUrl}
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
              <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.brand}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.gender}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {product.type}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-[1.1] mb-4 tracking-tighter">
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

          <div className="flex items-baseline gap-4 mb-8 lg:mb-12">
            <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
              ₹{product.salePrice}
            </p>
            <p className="text-xl sm:text-2xl line-through text-gray-300 font-bold">
              ₹{product.originalPrice}
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
                {sizes.map((size) => {
                  const variant = sizeMap[size];
                  const isAvailable = variant && variant.stock > 0;
                  const isSelected = currentProductSize === size;

                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => {
                        if (variant) {
                          navigate(`/product/${variant.id}`);
                        }
                      }}
                      disabled={!variant || !isAvailable}
                      className={`h-14 flex flex-col items-center justify-center rounded-2xl border-2 transition transform active:scale-95 ${
                        isSelected
                          ? "bg-black text-white border-black shadow-lg shadow-gray-200"
                          : variant
                            ? "bg-white text-gray-900 border-gray-50 hover:border-gray-900"
                            : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
                      } ${!isAvailable && variant ? "opacity-40" : ""}`}
                    >
                      <span className="text-sm font-black">{size}</span>
                      {variant && !isAvailable && (
                        <span className="text-[8px] uppercase">Sold</span>
                      )}
                    </button>
                  );
                })}
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
                className="flex-[2] bg-white text-black border-2 border-black h-20 rounded-3xl font-black text-xl uppercase tracking-tighter hover:bg-gray-50 transition transform active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent disabled:transform-none"
              >
                {product.stock === 0
                  ? "OUT OF STOCK"
                  : isAddedToCart
                    ? "VIEW IN CART"
                    : "ADD TO CART"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-[3] bg-black text-white h-20 rounded-3xl font-black text-xl uppercase tracking-tighter hover:bg-gray-800 transition transform active:scale-95 shadow-2xl shadow-gray-200 disabled:bg-gray-400 disabled:transform-none disabled:shadow-none"
              >
                BUY NOW
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
