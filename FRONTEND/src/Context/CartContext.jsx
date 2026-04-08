import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import cartService from '../services/cart.service';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../lib/http';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  // Cart API is user-role only; admins get 403 if we call it
  const isCustomer =
    isAuthenticated &&
    String(currentUser?.role ?? "").toLowerCase() === "user";

  const fetchCart = useCallback(async () => {
    if (!isCustomer) {
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cartData = await cartService.getCart();
      setCart(cartData?.items || []);
      setCartTotal(cartData?.totalPrice || 0);
      setCartCount(cartData?.totalItems || 0);
    } catch (e) {
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
      if (isCustomer) {
        toast.error(getErrorMessage(e) || "Could not load cart");
      }
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) {
      fetchCart();
    } else {
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, [isCustomer, fetchCart]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!isCustomer) {
      toast.error("Please login as a customer to add items to cart");
      return false;
    }
    const pid = product?.id ?? product?.productId;
    if (!pid) {
      toast.error("Invalid product");
      return false;
    }
    try {
      await cartService.addToCart(pid, quantity);
      await fetchCart();
      // Sync the product list status
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Added to cart 🛒");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to add to cart");
    }
  }, [isCustomer, fetchCart, queryClient]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isCustomer) return;
    if (!productId) {
      console.warn("[CartContext] removeFromCart called without productId");
      return;
    }
    try {
      await cartService.removeFromCart(productId);
      await fetchCart();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  }, [isCustomer, fetchCart, queryClient]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isCustomer) return;
    if (!productId) {
      console.warn("[CartContext] updateQuantity called without productId");
      return;
    }
    if (quantity < 1) {
      try {
        await cartService.removeFromCart(productId);
        await fetchCart();
      } catch {
        toast.error("Failed to update cart");
      }
      return;
    }
    try {
      await cartService.updateQuantity(productId, quantity);
      await fetchCart();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Failed to update quantity");
    }
  }, [isCustomer, fetchCart, queryClient]);

  const clearCart = useCallback(async () => {
    if (!isCustomer) return;
    try {
      await cartService.clearCart();
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  }, [isCustomer, queryClient]);

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;