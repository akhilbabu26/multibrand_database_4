import React from 'react'
// user side
import { Route, Routes } from 'react-router-dom'
import Registration from "./features/auth/Registration/Registration"
import Login from "./features/auth/Login/Login"
import Home from "./pages/Home"
import ShowAll from "./features/products/ShowAll"
import CartPage from "./pages/CartPage"
import WishList from "./pages/WishList"
import SearchPage from "./pages/SearchPage/SearchPage"
import CheckOutPage from "./features/auth/CheckOut/CheckOutPage"
import OrderPage from "./pages/OrderPage"
import ProductDetail from "./pages/ProductDetail"
import OrderDetailPage from "./pages/OrederDetailPage"

// Admin side
import AdminPage from "./features/admin/AdminPage"
import AdminRouter from "./routes/AdminRouter"
import UserRouter from "./routes/UserRouter"
import DashBoardPage from "./features/admin/DashBoardPage"
import UserInfo from "./features/admin/UserDetsils/UserInfo"
import OrdersInfo from "./features/admin/OrderDetails/OrdersInfo"
import ProductInfo from "./features/admin/ProductDetails/ProductInfo"
import ProductEdit from "./features/admin/ProductDetails/ProductEdit"
import Brands from "./features/admin/ProductDetails/Brands"
import AddProduct from "./features/admin/ProductDetails/AddProduct"


function App() {
  return (
    <div>
      
      <Routes>

        {/* public */}
        <Route path='/register' element={<Registration/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Home/>}/>
        

        {/* user */}
        <Route element={<UserRouter/>}>
          <Route path='/allshoe/:type' element={<ShowAll/>}/>
          <Route path='/cart' element={<CartPage/>}/>
          <Route path='/wishlist' element={<WishList/>}/>
          <Route path='/searchPage' element={<SearchPage/>}/>
          <Route path='/checkOut' element={<CheckOutPage/>}/>
          <Route path='/orderPage' element={<OrderPage/>}/>
          <Route path='/product/:productId' element={<ProductDetail/>}/>
          <Route path='/orders' element={<OrderDetailPage/>}/>
        </Route>

        {/* admin */}
        <Route  element={<AdminRouter />}>
          <Route path='/admin' element={<AdminPage/>}> 

            <Route index element={<DashBoardPage />} />
            <Route path="dashboard" element={<DashBoardPage />} />
            <Route path="userinfo" element={<UserInfo />} />
            <Route path="productInfo" element={<ProductInfo />} />
            <Route path="orderInfo" element={<OrdersInfo />} />

            <Route path="brands" element={<Brands />} />
            <Route path='productEdit/:productId' element={<ProductEdit/>}/>
            <Route path='addProduct' element={<AddProduct/>}/>
            
          </Route>
        </Route>


      </Routes>
     
    </div>
  )
}

export default App