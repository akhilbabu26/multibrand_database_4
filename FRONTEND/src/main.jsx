import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import CartProvider from "./context/CartContext"
import AuthProvider from "./context/AuthContext.jsx"
import { Toaster } from 'react-hot-toast'
import { WishlistProvider } from "./context/WishlistContext.jsx"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider> 
        <CartProvider>     
          <WishlistProvider>
            <App />
            <Toaster position="top-right" reverseOrder={false} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
)
