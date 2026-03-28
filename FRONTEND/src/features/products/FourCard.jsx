import React, { useState } from 'react'
import useFetch from "../../hooks/useFetch"
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../../components/common/ProductCard'

function FourCard() {

    const [items, setItems] = useState("Casual Retro Runner")
    const {data} = useFetch("/products")

    const navigate = useNavigate()

    const brands = data.filter(item => item.type === items).splice(0,4)

  return (
    <div className="bg-white">  
      <div className="text-center mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        
        <Link onClick={()=> setItems("Casual Retro Runner")}
        className="inline-block rounded-md border border-transparent  px-8 py-3 text-center font-medium  hover:bg-blue-50"
        >
        ADIDAS
        </Link>

        <Link onClick={()=> setItems("Lifestyle Basketball Sneaker")}
        className="inline-block rounded-md border border-transparent  px-8 py-3 text-center font-medium  hover:bg-blue-50"
        >
        NIKE
        </Link>

        <Link onClick={()=> setItems("Performance & Motorsport")}
        className="inline-block rounded-md border border-transparent  px-8 py-3 text-center font-medium  hover:bg-blue-50"
        > 
        PUMA
        </Link>

        <Link onClick={()=> setItems("Heritage Court & Fitness")}
        className="inline-block rounded-md border border-transparent  px-8 py-3 text-center font-medium  hover:bg-blue-50"
        >    
        REBOOK
        </Link>

        <Link onClick={()=> setItems("Premium Heritage Runner")}
        className="inline-block rounded-md border border-transparent  px-8 py-3 text-center font-medium  hover:bg-blue-50"
        >
        NEW BALANCE
        </Link>
        
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">New Arrivals</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {brands.map((product) => (
          <ProductCard key={product.id}  product={product} />
          ))}
        </div>
        <button 
          className="px-4 m-2 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition"
          onClick={() => navigate(`/allshoe/${items}`)}
        >
          View
        </button>

      </div>
    </div>
  )
}

export default FourCard
