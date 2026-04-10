import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

function ShowProduct({ product, onProductDelete }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const handleEdit = () => {
        navigate(`/admin/productEdit/${product.id}`)
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            try {
                await api.delete(`/admin/products/${product.id}`)
                queryClient.invalidateQueries({ queryKey: ["products"] })
                
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

    const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || 
                        product.images?.[0]?.imageUrl || 
                        product.imageUrl;

    return (
        <>
            <div className="hidden lg:grid grid-cols-12 items-center px-6 py-5 hover:bg-white transition-all duration-300 group border-b border-gray-50 last:border-b-0">
                {/* Product */}
                <div className="col-span-4 flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                        <img
                            src={primaryImage}
                            className="w-full h-full object-cover transform transition group-hover:scale-110"
                            alt={product.name}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm uppercase tracking-tight">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{product.gender}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STOCK: {product.stock}</span>
                        </div>
                    </div>
                </div>

                {/* Costs */}
                <div className="col-span-2 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cost</p>
                    <p className="font-bold text-gray-400 text-xs">₹{product.costPrice || 0}</p>
                </div>

                <div className="col-span-2 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sale</p>
                    <p className="font-black text-gray-900">₹{product.salePrice}</p>
                </div>

                {/* Discount */}
                <div className="col-span-2 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Discount</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        product.discountPercentage > 0 
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" 
                            : "bg-gray-50 text-gray-400 ring-1 ring-gray-100"
                    }`}>
                        {product.discountPercentage}% OFF
                    </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition transform active:scale-90 shadow-lg shadow-gray-200"
                        onClick={handleEdit}
                        title="Edit Product"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    <button 
                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition transform active:scale-90 border border-red-100"
                        onClick={handleDelete}
                        title="Delete Product"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden bg-white p-6 border-b border-gray-100 last:border-b-0 space-y-4">
                <div className="flex items-center gap-5">
                    <img
                        src={primaryImage}
                        className="w-20 h-20 object-cover rounded-2xl border border-gray-100 shadow-sm"
                        alt={product.name}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-lg uppercase tracking-tighter leading-tight">{product.name}</p>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 bg-indigo-50 inline-block px-3 py-1 rounded-full">{product.gender}'s {product.type}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">List Price</p>
                        <p className="font-bold text-gray-400 line-through text-xs">₹{product.originalPrice}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sale Price</p>
                        <p className="font-black text-gray-900">₹{product.salePrice}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock</p>
                        <p className="font-black text-gray-900">{product.stock}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Discount</p>
                        <span className="text-emerald-600 font-black text-xs">{product.discountPercentage}% OFF</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
                        onClick={handleEdit}
                    >
                        Edit Details
                    </button>
                    
                    <button 
                        className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 transition active:scale-95"
                        onClick={handleDelete}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}

export default React.memo(ShowProduct);
