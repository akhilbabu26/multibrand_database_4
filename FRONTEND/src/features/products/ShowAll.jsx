import React, { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from "../../hooks/useFetch"
import ProductCard from "../../components/common/ProductCard"
import { AuthContext } from "../../context/AuthContext"
import Navbar from "../../components/layout/Navbar/Navbar"

function ShowAll() {

  const { type } = useParams()
  const { data } = useFetch("/products")
  const {currentUser} = useContext(AuthContext)

  const navigate = useNavigate()

  

  const datas = data.filter(
    (value) => value.type === type
  )



  return (
    <div className='max-w-7xl mx-auto p-4'>
   
  {/* <button
    onClick={() => navigate("/")}
    className="mb-6 px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
  >
    BACK
  </button> */}

  <div className="w-full mb-6">
    {type === "Casual Retro Runner" && (
      <img
        src='https://mir-s3-cdn-cf.behance.net/project_modules/1400/13e36e124462013.61044211481a0.jpg'
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
      />
    )}

    {type === "Lifestyle Basketball Sneaker" && (
      <img
          src='https://mir-s3-cdn-cf.behance.net/project_modules/1400/13e36e124462013.61044211481a0.jpg'
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
      />
    )}

    {type === "Performance & Motorsport" && (
      <img
         src='https://mir-s3-cdn-cf.behance.net/project_modules/1400/13e36e124462013.61044211481a0.jpg'
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
      />
    )}

    {type === "Heritage Court & Fitness" && (
      <img
       src='https://mir-s3-cdn-cf.behance.net/project_modules/1400/13e36e124462013.61044211481a0.jpg'
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
      />
    )}

    {type === "Premium Heritage Runner" && (
      <img
        src=""
        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-sm"
      />
    )}
  </div>

  {/* Back Button */}

  {/* Product Grid */}
  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
    {datas.length > 0 ? (
      datas.map(product => (
        <ProductCard key={product.product_id} product={product} />
      ))
    ) : (
      <p>No products found</p>
    )}
  </div>

  <button
    className="flex items-center mt-3 gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
       onClick={() => navigate(-1)}
    >
      BACK
   </button>

</div>

  )
}

export default ShowAll

