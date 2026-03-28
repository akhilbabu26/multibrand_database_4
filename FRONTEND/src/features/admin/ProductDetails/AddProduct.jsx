import React from 'react'
import { Formik, Field, Form } from "formik";
import { useNavigate } from 'react-router-dom'
import { api } from "../../../api/Api";
import toast from 'react-hot-toast';


const initialValues = {
    product_id: "",
    name: "",
    type: "Casual Retro Runner",
    color: "",
    original_price: 0,
    sale_price: 0,
    discount_percentage: 0,
    image_url: "",
    description: "",
    cost_price: 0,
    isActive: true,
    quantity: 0
}

function AddProduct() {
    const navigate = useNavigate()

    const handleSubmit = async (values) => {
        try {
            const response = await api.post("/products", values)
            
            if (response.status === 201) { // 201 is when post in api if it is successful it response is 201
                toast.success('Product added successfully!')
                navigate(-1) // Go back to previous page
            }
        } catch (error) {
            console.error('Error adding product:', error)
            alert('Error adding product')
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    BACK
                </button>
            </div>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
                        
                        {/* Product ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID *
                            </label>
                            <Field 
                                name="product_id"
                                type="text"
                                placeholder="e.g., ADIDAS001"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <Field 
                                name="name"
                                type="text"
                                placeholder="e.g., SL 72 RS Shoes - Black"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand Type *
                            </label>
                            <Field 
                                as="select"
                                name="type"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="Casual Retro Runner">ADIDAS - Casual Retro Runner</option>
                                <option value="Lifestyle Basketball Sneaker">NIKE - Lifestyle Basketball Sneaker</option>
                                <option value="Performance & Motorsport">PUMA - Performance & Motorsport</option>
                                <option value="Heritage Court & Fitness">REEBOK - Heritage Court & Fitness</option>
                                <option value="Premium Heritage Runner">NEW BALANCE - Premium Heritage Runner</option>
                            </Field>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color *
                            </label>
                            <Field 
                                name="color"
                                type="text"
                                placeholder="e.g., Black/White"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Cost Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Price (₹) *
                            </label>
                            <Field 
                                name="cost_price"
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Original Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Original Price (₹) *
                            </label>
                            <Field 
                                name="original_price"
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Sale Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sale Price (₹) *
                            </label>
                            <Field 
                                name="sale_price"
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Percentage *
                            </label>
                            <Field 
                                name="discount_percentage"
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity in Stock *
                            </label>
                            <Field 
                                name="quantity"
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                min="0"
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL *
                            </label>
                            <Field 
                                name="image_url"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {values.image_url && (
                                <img 
                                    src={values.image_url} 
                                    alt="Preview" 
                                    className="mt-2 w-20 h-20 object-cover rounded border"
                                />
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <Field 
                                as="textarea"
                                name="description"
                                rows="3"
                                placeholder="Enter product description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <Field 
                                type="checkbox"
                                name="isActive"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Product is Active
                            </label>
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
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default AddProduct