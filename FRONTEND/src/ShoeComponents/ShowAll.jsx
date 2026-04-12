import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from '../Hooks/useFetch'
import ProductCard from './ProductCard'

function ShowAll() {
  const { type: brand } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const url = brand === 'all'
    ? `/products?page=${page}`
    : `/products?brand=${encodeURIComponent(brand)}&page=${page}`

  const { data, loading, meta } = useFetch(url)

  const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10))

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-8'>
      <div className="w-full mb-10 overflow-hidden rounded-2xl shadow-lg relative h-64 md:h-96">
        <img
          src='https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop'
          className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
          alt={brand}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            {brand === 'all' ? 'All Products' : brand}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 w-full mb-3" />
              <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
              <div className="bg-gray-200 rounded h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-xl font-medium">
            No products found in this category
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-indigo-600 font-bold hover:underline"
          >
            Return to home
          </button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-6 py-2 rounded-lg font-bold text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-6 py-2 rounded-lg font-bold text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-12 flex justify-center">
        <button
          className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition transform active:scale-95 shadow-lg"
          onClick={() => navigate(-1)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          BACK
        </button>
      </div>
    </div>
  )
}

export default ShowAll