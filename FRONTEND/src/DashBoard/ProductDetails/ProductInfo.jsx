import React from 'react'
import Brands from './Brands'

function ProductInfo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Product Management</h1>
          <p className="text-gray-500 font-medium">Manage your inventory, pricing, and stock status.</p>
        </div>

        <Brands />
      </div>
    </div>
  )
}

export default React.memo(ProductInfo)
