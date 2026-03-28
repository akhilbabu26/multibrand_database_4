import React from 'react'
import { Formik, Field, Form } from "formik";
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from "../../../hooks/useFetch";
import { api } from "../../../api/Api";


function ProductEdit() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { data, loading } = useFetch("/products")

    const currentProduct = data?.find(x => x.product_id === productId)

    const handleSubmit = async (values) => {
        try {
            const response = await api.put(`/products/${currentProduct.id}`, values)
            
            if (response.status === 200) {
                alert('Product updated successfully!')
                navigate(-1)
            }
        } catch (error) {
            console.error('Error updating product:', error)
            alert('Error updating product')
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!currentProduct) {
        return <div>Product not found</div>
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    BACK
                </button>
            </div>

            <Formik
                initialValues={{
                    product_id: currentProduct.product_id || "",
                    name: currentProduct.name || "",
                    type: currentProduct.type || "",
                    color: currentProduct.color || "",
                    original_price: currentProduct.original_price || 0,
                    sale_price: currentProduct.sale_price || 0,
                    discount_percentage: currentProduct.discount_percentage || 0,
                    image_url: currentProduct.image_url || "",
                    description: currentProduct.description || "",
                    cost_price: currentProduct.cost_price || 0,
                }}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
                        
                        {/* Product ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID
                            </label>
                            <Field 
                                name="product_id"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <Field 
                                name="name"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <Field 
                                as="select"
                                name="type"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="Casual Retro Runner">Casual Retro Runner</option>
                                <option value="Lifestyle Basketball Sneaker">Lifestyle Basketball Sneaker</option>
                                <option value="Performance & Motorsport">Performance & Motorsport</option>
                                <option value="Heritage Court & Fitness">Heritage Court & Fitness</option>
                                <option value="Premium Heritage Runner">Premium Heritage Runner</option>
                            </Field>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <Field 
                                name="color"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Cost Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Price (₹)
                            </label>
                            <Field 
                                name="cost_price"
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Original Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Original Price (₹)
                            </label>
                            <Field 
                                name="original_price"
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Sale Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sale Price (₹)
                            </label>
                            <Field 
                                name="sale_price"
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Percentage
                            </label>
                            <Field 
                                name="discount_percentage"
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <Field 
                                name="image_url"
                                type="url"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {currentProduct.image_url && (
                                <img 
                                    src={currentProduct.image_url} 
                                    alt="Preview" 
                                    className="mt-2 w-20 h-20 object-cover rounded border"
                                />
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Field 
                                as="textarea"
                                name="description"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ProductEdit