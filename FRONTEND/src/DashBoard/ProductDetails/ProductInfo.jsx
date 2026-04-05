import React from 'react'
import useFetch from '../../Hooks/useFetch'
import Brands from './Brands'

function ProductInfo() {
  const { data, loading, meta } = useFetch("/admin/products?limit=100")

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-3 border-gray-200 border-t-gray-600 rounded-full"></div>
          <p className="text-gray-500 text-sm">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Product Management</h1>
          <div className="flex items-center gap-6">
            <p className="text-gray-600">Total products: <span className="font-medium text-gray-900">{meta?.total ?? data.length}</span></p>
            
          </div>

           <Brands/>
        </div>
        
      </div>
    </div>
  )
}

export default React.memo(ProductInfo)
