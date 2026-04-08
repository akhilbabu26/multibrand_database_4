import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { CartContext } from './CartContext';
import wishlistService from '../services/wishlist.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../lib/http';

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const cartCtx = useContext(CartContext);
  const isCustomer =
    isAuthenticated &&
    String(currentUser?.role ?? "").toLowerCase() === "user";

  const fetchWishlist = useCallback(async () => {
    if (!isCustomer) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const inner = await wishlistService.getWishlist();
      const rows = inner?.wishlist ?? (Array.isArray(inner) ? inner : []);
      const normalized = rows.map((row) => {
        const p = row.product;
        if (!p) {
          return {
            productId: row.productId,
            id: row.productId,
            name: 'Product',
            salePrice: 0,
            imageUrl: '',
          };
        }
        return {
          productId: row.productId ?? p.id,
          id: p.id,
          name: p.name,
          salePrice: p.salePrice,
          imageUrl: p.imageUrl,
        };
      });
      setWishlist(normalized);
    } catch (e) {
      setWishlist([]);
      if (isCustomer) {
        toast.error(getErrorMessage(e) || "Could not load wishlist");
      }
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isCustomer, fetchWishlist]);

  const addToWishlist = useCallback(async (product) => {
    if (!isCustomer) {
      toast.error("Please login as a customer to use the wishlist");
      return;
    }
    const pid = product?.id ?? product?.productId;
    if (pid == null) {
      toast.error("Invalid product");
      return;
    }
    try {
      await wishlistService.addToWishlist(pid);
      await fetchWishlist();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Added to wishlist 💖");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to add to wishlist");
    }
  }, [isCustomer, fetchWishlist, queryClient]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!isCustomer) return;
    const idStr = String(productId);
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) =>
        prev.filter((item) => String(item.productId) !== idStr)
      );
      await fetchWishlist();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to remove from wishlist");
      await fetchWishlist();
    }
  }, [isCustomer, fetchWishlist, queryClient]);

  const toggleWishlist = useCallback(async (product) => {
    if (!isCustomer) {
      toast.error("Please login as a customer to manage wishlist");
      return;
    }
    const pid = product?.id ?? product?.productId;
    if (pid == null) {
      toast.error("Invalid product");
      return;
    }
    const exists = wishlist.some(
      (item) => String(item.productId) === String(pid)
    );
    if (exists) {
      await removeFromWishlist(pid);
    } else {
      await addToWishlist({ ...product, id: pid });
    }
  }, [isCustomer, wishlist, addToWishlist, removeFromWishlist]);

  // productId is the key since that's what backend returns
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(
      (item) => String(item.productId) === String(productId)
    );
  }, [wishlist]);

  const moveToCart = useCallback(async (productId) => {
    if (!isCustomer) {
      toast.error("Please login as a customer to move items to cart");
      return;
    }
    const idStr = String(productId);
    try {
      await wishlistService.moveToCart(productId);
      setWishlist((prev) =>
        prev.filter((item) => String(item.productId) !== idStr)
      );
      await cartCtx?.fetchCart?.();
      await fetchWishlist();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Moved to cart 🛒");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to move to cart");
      await fetchWishlist();
    }
  }, [isCustomer, cartCtx, fetchWishlist, queryClient]);

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