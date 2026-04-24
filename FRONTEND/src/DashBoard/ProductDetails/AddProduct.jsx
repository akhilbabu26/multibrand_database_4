import React, { useEffect, useRef, useState } from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import productService from "../../services/product.service";
import { appendCreateProduct } from "../../lib/productFormData";
import { getErrorMessage } from "../../lib/http";
import { useQueryClient } from "@tanstack/react-query";

const initialValues = {
  name: "",
  brand: "Adidas",
  type: "Casual Retro Runner",
  color: "",
  gender: "unisex",
  description: "",
  variants: [
    {
      size: "40",
      costPrice: 0,
      originalPrice: 0,
      discountPercentage: 0,
      salePrice: 0,
      stock: 0,
    }
  ]
};

const brands = ["Adidas", "Nike", "Puma", "Reebok", "New Balance"];
const types = ["Casual Retro Runner", "Lifestyle Basketball Sneaker", "Performance & Motorsport"];
const sizes = ["38", "39", "40", "41", "42", "43", "44"];
const genders = ["men", "women", "unisex", "kids"];

function AddProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (e.target) e.target.value = "";
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Add product</h1>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting: sf }) => {
          if (!selectedFiles.length) {
            toast.error("Add at least one product image");
            return;
          }
          if (!values.variants || values.variants.length === 0) {
            toast.error("Add at least one product variant");
            return;
          }
          setSubmitting(true);
          sf(true);
          try {
            const transformedVariants = values.variants.map(v => ({
              size: v.size,
              cost_price: Number(v.costPrice),
              original_price: Number(v.originalPrice),
              discount_percentage: Number(v.discountPercentage),
              stock: Number(v.stock)
            }));
            const payload = { ...values, variants: transformedVariants };

            const fd = new FormData();
            appendCreateProduct(fd, payload, selectedFiles);
            await productService.createProduct(fd);
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created");
            navigate("/admin/productInfo");
          } catch (e) {
            toast.error(getErrorMessage(e) || "Create failed");
          } finally {
            setSubmitting(false);
            sf(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => {
          const updateSalePrice = (index, orig, disc) => {
            const sale = Math.round(orig - (orig * disc) / 100);
            setFieldValue(`variants.${index}.salePrice`, sale);
          };

          return (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-50">
                  General
                </h2>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <Field
                    name="name"
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                    <Field as="select" name="brand" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <Field as="select" name="type" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </Field>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                    <Field name="color" className="w-full px-4 py-3 border rounded-xl bg-gray-50" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <Field as="select" name="gender" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </Field>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <Field as="textarea" name="description" rows="4" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                </div>
              </div>

              <div className="space-y-8">
                <FieldArray name="variants">
                  {({ push, remove }) => (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Variants (Size, Stock & Pricing)</h2>
                        <button
                          type="button"
                          onClick={() => push({ size: "40", costPrice: 0, originalPrice: 0, discountPercentage: 0, salePrice: 0, stock: 0 })}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition"
                        >
                          + Add Variant
                        </button>
                      </div>

                      {values.variants && values.variants.map((variant, index) => (
                        <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative">
                          {values.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                              title="Remove variant"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <h3 className="font-bold text-gray-700 mb-4">Variant #{index + 1}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Size</label>
                              <Field as="select" name={`variants.${index}.size`} className="w-full px-4 py-3 border rounded-xl bg-white">
                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                              </Field>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                              <Field name={`variants.${index}.stock`} type="number" min="0" className="w-full px-4 py-3 border rounded-xl bg-white" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost (₹)</label>
                              <Field name={`variants.${index}.costPrice`} type="number" step="0.01" className="w-full px-4 py-3 border rounded-xl bg-white" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original (₹)</label>
                              <Field
                                name={`variants.${index}.originalPrice`}
                                type="number"
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFieldValue(`variants.${index}.originalPrice`, val);
                                  updateSalePrice(index, val, variant.discountPercentage);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount %</label>
                              <Field
                                name={`variants.${index}.discountPercentage`}
                                type="number"
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFieldValue(`variants.${index}.discountPercentage`, val);
                                  updateSalePrice(index, variant.originalPrice, val);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Sale (₹)</label>
                              <Field name={`variants.${index}.salePrice`} type="number" className="w-full px-4 py-3 border rounded-xl bg-indigo-50 font-bold" readOnly />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Products Images</h2>
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      {previews.length} selected
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    The first image will be used as the primary thumbnail.
                  </p>

                  <div className="relative group">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-gray-700">Click to upload images</span>
                        <span className="block text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                      </div>
                    </button>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {previews.map((url, idx) => (
                        <div key={idx} className="relative aspect-square group rounded-2xl overflow-hidden border border-gray-100">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center py-1">
                            {idx === 0 && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">Main</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Creating…" : "Create product"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default AddProduct;