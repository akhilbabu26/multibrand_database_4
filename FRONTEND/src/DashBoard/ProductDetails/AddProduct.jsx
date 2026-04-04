import React, { useState } from 'react'
import { Formik, Field, Form, FieldArray } from "formik";
import { useNavigate } from 'react-router-dom'
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialValues = {
    name: "",
    type: "Casual Retro Runner",
    color: "",
    original_price: 0,
    cost_price: 0,
    discount_percentage: 0,
    sale_price: 0,
    size: "40",
    gender: "unisex",
    stock: 0,
    is_active: true,
    description: "",
    images: [
        { image_url: "", is_primary: true }
    ]
}

function AddProduct() {
    const navigate = useNavigate()

    const handleSubmit = async (values) => {
        try {
            // Calculate sale price if not already set correctly
            const finalValues = {
                ...values,
                sale_price: Math.round(values.original_price - (values.original_price * values.discount_percentage) / 100)
            }

            const response = await api.post("/products", finalValues)
            
            if (response.status === 201 || response.status === 200) {
                toast.success('Product added successfully!')
                navigate(-1)
            }
        } catch (error) {
            console.error('Error adding product:', error)
            toast.error('Error adding product')
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Add New Product</h1>
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
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values, setFieldValue }) => {
                    // Update sale price automatically when original_price or discount_percentage changes
                    const updateSalePrice = (orig, disc) => {
                        const sale = Math.round(orig - (orig * disc) / 100);
                        setFieldValue('sale_price', sale);
                    };

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT COLUMN: BASIC INFO */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50">General Information</h2>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Product Name</label>
                                    <Field 
                                        name="name"
                                        type="text"
                                        placeholder="e.g., SL 72 RS Shoes - Black"
                                        className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Type</label>
                                        <Field 
                                            as="select"
                                            name="type"
                                            className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                                            required
                                        >
                                            <option value="Casual Retro Runner">Retro Runner</option>
                                            <option value="Lifestyle Basketball Sneaker">Basketball Sneaker</option>
                                            <option value="Performance & Motorsport">Performance</option>
                                            <option value="Heritage Court & Fitness">Court & Fitness</option>
                                            <option value="Premium Heritage Runner">Heritage Runner</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Color</label>
                                        <Field 
                                            name="color"
                                            type="text"
                                            placeholder="e.g., Black/White"
                                            className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Gender</label>
                                        <Field as="select" name="gender" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition">
                                            <option value="men">Men</option>
                                            <option value="women">Women</option>
                                            <option value="unisex">Unisex</option>
                                            <option value="kids">Kids</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Size (EU)</label>
                                        <Field as="select" name="size" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition">
                                            {["38", "39", "40", "41", "42", "43", "44"].map(s => <option key={s} value={s}>{s}</option>)}
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Stock</label>
                                        <Field name="stock" type="number" min="0" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                                    <Field as="textarea" name="description" rows="4" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition" placeholder="Tell more about the product..." />
                                </div>
                                
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <Field type="checkbox" name="is_active" className="w-5 h-5 rounded text-indigo-600" />
                                    <label className="text-sm font-bold text-gray-700">Set as Active Product</label>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: PRICING & IMAGES */}
                            <div className="space-y-8">
                                {/* PRICING CARD */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50">Pricing Structure</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Cost Price (₹)</label>
                                            <Field name="cost_price" type="number" step="0.01" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-green-100 transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Original Price (₹)</label>
                                            <Field 
                                                name="original_price" 
                                                type="number" 
                                                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition" 
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setFieldValue('original_price', val);
                                                    updateSalePrice(val, values.discount_percentage);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Discount %</label>
                                            <Field 
                                                name="discount_percentage" 
                                                type="number" 
                                                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition" 
                                                max="100"
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setFieldValue('discount_percentage', val);
                                                    updateSalePrice(values.original_price, val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-indigo-600">Final Sale Price (₹)</label>
                                            <Field name="sale_price" type="number" className="w-full px-4 py-3 border border-indigo-100 rounded-xl bg-indigo-50 font-black text-indigo-700 cursor-not-allowed" readOnly />
                                        </div>
                                    </div>
                                </div>

                                {/* IMAGES CARD */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                        <h2 className="text-xl font-bold text-gray-800">Product Images</h2>
                                        <p className="text-xs font-bold text-gray-400">Add up to 5 images</p>
                                    </div>
                                    <FieldArray name="images">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {values.images.map((img, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <Field name={`images.${index}.image_url`} placeholder="Image URL..." className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" required />
                                                                <button type="button" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" disabled={values.images.length === 1}>
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
                                                                    <Field type="checkbox" name={`images.${index}.is_primary`} className="w-4 h-4 text-indigo-600 rounded" 
                                                                        onChange={() => {
                                                                            values.images.forEach((_, i) => setFieldValue(`images.${i}.is_primary`, i === index));
                                                                        }}
                                                                        checked={img.is_primary}
                                                                    />
                                                                    Make Primary Image
                                                                </label>
                                                                {img.image_url && <img src={img.image_url} alt="p" className="w-10 h-10 object-cover rounded-lg ml-auto border border-white shadow-sm" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {values.images.length < 5 && (
                                                    <button type="button" onClick={() => push({ image_url: "", is_primary: false })} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                        Add Another Image
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400">
                                    {isSubmitting ? 'CREATING...' : 'CREATE PRODUCT'}
                                </button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default AddProduct;
