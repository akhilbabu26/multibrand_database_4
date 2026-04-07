import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFetch from '../Hooks/useFetch'
import ProductCard from './ProductCard'

const BRANDS = [
  { label: 'ALL',         value: 'all' },
  { label: 'ADIDAS',      value: 'Adidas' },
  { label: 'NIKE',        value: 'Nike' },
  { label: 'PUMA',        value: 'Puma' },
  { label: 'REEBOK',      value: 'Reebok' },
  { label: 'NEW BALANCE', value: 'New Balance' },
]

function FourCard() {
  const [activeBrand, setActiveBrand] = useState(BRANDS[0])
  const navigate = useNavigate()

  // Uses backend brand filter instead of type
  const { data, loading } = useFetch(
    activeBrand.value === 'all' 
      ? '/products'
      : `/products?brand=${encodeURIComponent(activeBrand.value)}&limit=4`
  )

  return (
    <div className="bg-white">
      <div className="text-center mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">

        {/* Brand Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {BRANDS.map((brand) => (
            <button
              key={brand.value}
              onClick={() => setActiveBrand(brand)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors border
                ${activeBrand.value === brand.value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {brand.label}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          New Arrivals
        </h2>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 w-full mb-3" />
                <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
                <div className="bg-gray-200 rounded h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-gray-400 py-12">No products found for this brand.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <button
          className="mt-8 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition text-sm font-medium"
          onClick={() => navigate(activeBrand.value === 'all' ? '/allshoe/all' : `/allshoe/${activeBrand.value}`)}
        >
          View All {activeBrand.label}
        </button>

      </div>
    </div>
  )
}

export default FourCard