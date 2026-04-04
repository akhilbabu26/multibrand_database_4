import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import cartService from '../services/cartService';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cartService.getCart();
      const cartData = res?.data;
      setCart(cartData?.items || []);
      setCartTotal(cartData?.total_price || 0);
      setCartCount(cartData?.total_items || 0);
    } catch (err) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return false;
    }
    try {
      await cartService.addToCart(product.id);
      await fetchCart(); // refetch to get accurate totals from backend
      toast.success("Added to cart 🛒");
      return true;
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
      return false;
    }
  }, [isAuthenticated, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      await fetchCart();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await cartService.updateQuantity(productId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart([]);
      setCartTotal(0);
      setCartCount(0);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  }, []);

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