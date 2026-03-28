import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/Api";
import toast from "react-hot-toast";

function ShowProduct({ product, onProductDelete }) {
    const navigate = useNavigate()

    const handleEdit = () => {
        navigate(`/admin/productEdit/${product.product_id}`)
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            try {
                // Delete from JSON file via API
                await api.delete(`/products/${product.id}`)
                
                // Remove from UI immediately
                if (onProductDelete) {
                    onProductDelete(product.id)
                }
                
                toast.success('Product deleted successfully!')
            } catch (error) {
                console.error('Error deleting product:', error)
                toast.error('Error deleting product')
            }
        }
    }

    return (
        <>
            
            <div className="hidden lg:grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200">
                {/* Product */}
                <div className="col-span-4 flex items-center gap-4">
                    <img
                        src={product.image_url}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                        alt={product.name}
                    />
                    <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                </div>

                {/* Selling Price */}
                <div className="col-span-2 text-center">
                    <p className="font-medium text-gray-900">₹{product.sale_price}</p>
                </div>

                {/* Cost Price */}
                <div className="col-span-2 text-center">
                    <p className="font-medium text-gray-900">₹{product.original_price}</p>
                </div>

                {/* Discount */}
                <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.discount_percentage > 0 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}>
                        {product.discount_percentage}%
                    </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-2">
                    <button 
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200 text-sm"
                        onClick={handleEdit}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    
                    <button 
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200 text-sm"
                        onClick={handleDelete}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden bg-white p-4 border-b border-gray-200">
                <div className="flex items-start gap-4 mb-4">
                    <img
                        src={product.image_url}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                        alt={product.name}
                    />
                    <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base mb-1">{product.name}</p>
                        <p className="text-gray-500 text-sm">{product.category}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Cost Price</p>
                        <p className="font-medium text-gray-900">₹{product.original_price}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                        <p className="font-medium text-gray-900">₹{product.sale_price}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Discount</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.discount_percentage > 0 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}>
                            {product.discount_percentage}%
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200 text-sm"
                        onClick={handleEdit}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200 text-sm"
                        onClick={handleDelete}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </>
    );
}

export default React.memo(ShowProduct);