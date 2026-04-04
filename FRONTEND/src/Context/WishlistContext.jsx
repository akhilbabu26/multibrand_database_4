import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import wishlistService from '../services/wishlistService';
import toast from 'react-hot-toast';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res?.data || []);
    } catch (err) {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      return;
    }
    try {
      await wishlistService.addToWishlist(product.id);
      await fetchWishlist();
      toast.success("Added to wishlist 💖");
    } catch (err) {
      toast.error(err?.message || "Failed to add to wishlist");
    }
  }, [isAuthenticated, fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      return;
    }
    const exists = wishlist.some(item => item.product_id === product.id);
    if (exists) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  }, [isAuthenticated, wishlist, addToWishlist, removeFromWishlist]);

  // product_id is the key since that's what backend returns
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const moveToCart = useCallback(async (productId) => {
    try {
      await wishlistService.moveToCart(productId);
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      toast.success("Moved to cart 🛒");
    } catch (err) {
      toast.error("Failed to move to cart");
    }
  }, []);

  const value = useMemo(() => ({
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    moveToCart,
  }), [wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, moveToCart]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistProvider;