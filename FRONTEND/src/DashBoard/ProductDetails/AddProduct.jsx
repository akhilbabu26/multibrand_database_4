import React, { useEffect, useRef, useState } from "react";
import { Formik, Field, Form } from "formik";
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
  originalPrice: 0,
  costPrice: 0,
  discountPercentage: 0,
  salePrice: 0,
  size: "40",
  gender: "unisex",
  stock: 0,
  description: "",
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
      <div className="flex items-center justify-between mb-8">
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
          setSubmitting(true);
          sf(true);
          try {
            const fd = new FormData();
            appendCreateProduct(fd, values, selectedFiles);
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
          const updateSalePrice = (orig, disc) => {
            const sale = Math.round(orig - (orig * disc) / 100);
            setFieldValue("salePrice", sale);
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                    <Field name="color" className="w-full px-4 py-3 border rounded-xl bg-gray-50" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <Field as="select" name="gender" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Size</label>
                    <Field as="select" name="size" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                    <Field name="stock" type="number" min="0" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <Field as="textarea" name="description" rows="4" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Pricing</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cost (₹)</label>
                      <Field name="costPrice" type="number" step="0.01" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Original (₹)</label>
                      <Field
                        name="originalPrice"
                        type="number"
                        className="w-full px-4 py-3 border rounded-xl bg-gray-50"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFieldValue("originalPrice", val);
                          updateSalePrice(val, values.discountPercentage);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                      <Field
                        name="discountPercentage"
                        type="number"
                        className="w-full px-4 py-3 border rounded-xl bg-gray-50"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFieldValue("discountPercentage", val);
                          updateSalePrice(values.originalPrice, val);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Sale (₹)</label>
                      <Field name="salePrice" type="number" className="w-full px-4 py-3 border rounded-xl bg-indigo-50 font-bold" readOnly />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
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
                    <div className="grid grid-cols-4 gap-3 mt-4">
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