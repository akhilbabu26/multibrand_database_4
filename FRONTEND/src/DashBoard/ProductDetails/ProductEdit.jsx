import React from 'react'
import { Formik, Field, Form, FieldArray } from "formik";
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import api from '../../services/api';
import toast from 'react-hot-toast';

function ProductEdit() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { data, loading } = useFetch("/products")

    const currentProduct = data?.find(x => x.product_id === productId)

    const handleSubmit = async (values) => {
        try {
            // Ensure sale price is calculated
            const finalValues = {
                ...values,
                sale_price: Math.round(values.original_price - (values.original_price * values.discount_percentage) / 100)
            }

            const response = await api.put(`/products/${currentProduct.id}`, finalValues)
            
            if (response.status === 200) {
                toast.success('Product updated successfully!')
                navigate(-1)
            }
        } catch (error) {
            console.error('Error updating product:', error)
            toast.error('Error updating product')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!currentProduct) {
        return <div className="p-20 text-center text-gray-500 font-bold">Product not found</div>
    }

    const initialValues = {
        name: currentProduct.name || "",
        type: currentProduct.type || "Casual Retro Runner",
        color: currentProduct.color || "",
        original_price: currentProduct.original_price || 0,
        cost_price: currentProduct.cost_price || 0,
        discount_percentage: currentProduct.discount_percentage || 0,
        sale_price: currentProduct.sale_price || 0,
        size: currentProduct.size || "40",
        gender: currentProduct.gender || "unisex",
        stock: currentProduct.stock || 0,
        is_active: currentProduct.is_active ?? true,
        description: currentProduct.description || "",
        images: currentProduct.images && currentProduct.images.length > 0 
                ? currentProduct.images 
                : [{ image_url: currentProduct.image_url || "", is_primary: true }]
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center">Edit Product</h1>
                <button
                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95"
                    onClick={() => navigate(-1)}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    BACK
                </button>
            </div>

            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values, setFieldValue }) => {
                    const updateSalePrice = (orig, disc) => {
                        const sale = Math.round(orig - (orig * disc) / 100);
                        setFieldValue('sale_price', sale);
                    };

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT COLUMN */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50 uppercase tracking-widest text-sm">Basic Info</h2>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                    <Field name="name" type="text" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                        <Field as="select" name="type" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition">
                                            <option value="Casual Retro Runner">Retro Runner</option>
                                            <option value="Lifestyle Basketball Sneaker">Basketball Sneaker</option>
                                            <option value="Performance & Motorsport">Performance</option>
                                            <option value="Heritage Court & Fitness">Court & Fitness</option>
                                            <option value="Premium Heritage Runner">Heritage Runner</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                                        <Field name="color" type="text" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                        <Field as="select" name="gender" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition">
                                            <option value="men">Men</option>
                                            <option value="women">Women</option>
                                            <option value="unisex">Unisex</option>
                                            <option value="kids">Kids</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Size</label>
                                        <Field as="select" name="size" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition">
                                            {["38", "39", "40", "41", "42", "43", "44"].map(s => <option key={s} value={s}>{s}</option>)}
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                                        <Field name="stock" type="number" min="0" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <Field as="textarea" name="description" rows="4" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 transition" />
                                </div>
                                
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <Field type="checkbox" name="is_active" className="w-5 h-5 rounded text-indigo-600" />
                                    <label className="text-sm font-bold text-gray-700">Set as Active Product</label>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50 uppercase tracking-widest text-sm">Pricing</h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cost Price (₹)</label>
                                            <Field name="cost_price" type="number" className="w-full px-4 py-3 border border-gray-50 rounded-xl bg-gray-50" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (₹)</label>
                                            <Field 
                                                name="original_price" 
                                                type="number" 
                                                className="w-full px-4 py-3 border border-gray-50 rounded-xl bg-gray-50" 
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setFieldValue('original_price', val);
                                                    updateSalePrice(val, values.discount_percentage);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                                            <Field 
                                                name="discount_percentage" 
                                                type="number" 
                                                className="w-full px-4 py-3 border border-gray-50 rounded-xl bg-gray-50" 
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setFieldValue('discount_percentage', val);
                                                    updateSalePrice(values.original_price, val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-indigo-600 mb-2">Sale Price (₹)</label>
                                            <Field name="sale_price" type="number" className="w-full px-4 py-3 border border-indigo-100 rounded-xl bg-indigo-50 font-black text-indigo-700" readOnly />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50 uppercase tracking-widest text-sm">Images</h2>
                                    <FieldArray name="images">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {values.images.map((img, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                        <div className="flex gap-3">
                                                            <Field name={`images.${index}.image_url`} placeholder="Image URL..." className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" required />
                                                            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" disabled={values.images.length === 1}>
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                            </button>
                                                        </div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                                                            <Field type="checkbox" name={`images.${index}.is_primary`} className="w-4 h-4 text-indigo-600 rounded" 
                                                                onChange={() => {
                                                                    values.images.forEach((_, i) => setFieldValue(`images.${i}.is_primary`, i === index));
                                                                }}
                                                                checked={img.is_primary}
                                                            />
                                                            Primary Image
                                                        </label>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => push({ image_url: "", is_primary: false })} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                                                    + Add Image
                                                </button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 transition shadow-xl disabled:bg-gray-400">
                                    {isSubmitting ? 'UPDATING...' : 'UPDATE PRODUCT'}
                                </button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default ProductEdit;
