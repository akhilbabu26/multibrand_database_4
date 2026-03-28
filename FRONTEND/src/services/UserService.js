import { api } from "../api/Api";

class UserService {
  /**
   * Updates only the user's cart
   */
  static async updateCart(userId, cart) {
    if (!userId) throw new Error("User ID is required");
    const response = await api.patch(`/users/${userId}`, { cart });
    return response.data;
  }

  /**
   * Updates only the user's wishlist
   */
  static async updateWishlist(userId, wishlist) {
    if (!userId) throw new Error("User ID is required");
    const response = await api.patch(`/users/${userId}`, { wishlist });
    return response.data;
  }

  /**
   * Updates multiple fields at once (e.g. moving from wishlist to cart)
   */
  static async updateUserData(userId, data) {
    if (!userId) throw new Error("User ID is required");
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  }
}

export default UserService;
