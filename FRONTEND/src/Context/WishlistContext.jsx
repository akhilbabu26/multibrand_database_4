import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import UserService from '../services/UserService';
import toast from 'react-hot-toast';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { currentUser } = useContext(AuthContext);

  // Load wishlist from currentUser when component mounts or user changes
  useEffect(() => {
    if (currentUser?.wishlist) {
      setWishlist(currentUser.wishlist);
    } else {
      setWishlist([]);
    }
  }, [currentUser]);

  const toggleWishlist = async (product) => {
    if (!currentUser) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      const exists = wishlist.some(item => item.product_id === product.product_id);
      const newWishlist = exists
        ? wishlist.filter(item => item.product_id !== product.product_id)
        : [...wishlist, product];

      await UserService.updateWishlist(currentUser.id, newWishlist);
      
      // Update local storage with latest user data
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, wishlist: newWishlist };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      setWishlist(newWishlist);

      if (!exists) toast.success(`Added to Wishlist 💖`);
      if (exists) toast.success(`Removed from Wishlist`);

    } catch (err) {
      console.error("Failed to update wishlist", err);
      toast.error("Error updating wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
