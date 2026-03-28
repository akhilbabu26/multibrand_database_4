// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { AuthContext } from './AuthContext';
// import { api } from "../api/Api";


// export const CartContext = createContext()

// function CartProvider({ children }){
 
//   const [cart, setCart] = useState([])
  
//   const {currentUser, allUsers} = useContext(AuthContext)

//   useEffect(() => {
//     if (currentUser?.cart) { // it is null safety it uses when their currentuser and its cart in something
//       setCart(currentUser.cart);
//     }else{
//       setCart([])  //----
//     }
//   }, [currentUser]);
   
//   useEffect(()=>{
//     const updateCart = async()=>{

//       if (!currentUser?.id) return;

//         try{
//            // const isExist = allUsers.find(data=> data?.email === currentUser?.email)  
//             //if(isExist){
//                 await api.patch(`/users/${currentUser.id}`,{cart:cart})
//             //}
//         }
//         catch(err){alert(err)}
       
//     }
//    // updateCart()

//    if (currentUser) {
//       updateCart();
//     }

//   },[cart, currentUser?.id])

//     return (
//         <CartContext.Provider value={{ cart, setCart}}>
//             {children}
//         </CartContext.Provider>
//     )
// }

// export default CartProvider

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext';
import { api } from "../api/Api";
import UserService from '../services/UserService';

export const CartContext = createContext()

function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const { currentUser } = useContext(AuthContext)

  // Load cart from currentUser when component mounts or user changes
  useEffect(() => {

    if (currentUser?.cart) {

      setCart(currentUser.cart)
    } else {
      console.log(" empty cart")
      setCart([])
    }
  }, [currentUser])

  // Sync cart to backend when cart changes
  useEffect(() => {
    const updateCart = async () => {

      // if no user or user doesn't have id
      // if (!currentUser?.id) {
      //   console.log("No user  fount")
      //   return
      // }
      
      try {
        await UserService.updateCart(currentUser.id, cart)
        
        // Update local storage with latest user data
        const updatedUser = { ...currentUser, cart: cart }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
      } catch (err) {
        console.error("Failed to sync cart:", err)
        console.error("Error details:", err.response?.data)
      }
    }

    // Only if user is logged in and we have a cart
    if (currentUser && Array.isArray(cart)) {
      updateCart()
    }
  }, [cart, currentUser])

  // Debug cart changes
  // useEffect(() => {
  //   console.log("Cart updated:", cart)
  // }, [cart])

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
