import React, { useEffect, useRef, useState } from "react";
import { Formik, Field, Form } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import productService from "../../services/product.service";
import { appendUpdateProduct } from "../../lib/productFormData";
import { getErrorMessage } from "../../lib/http";

function ProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [metadata, setMetadata] = useState({
    brands: [],
    types: [],
    sizes: [],
    genders: [],
  });

  useEffect(() => {
    productService.getMetadata()
      .then(data => setMetadata(data))
      .catch(err => console.error("Metadata fetch failed", err));
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const brands = metadata.brands?.length ? metadata.brands : ["Adidas", "Nike", "Puma", "Reebok", "New Balance"];
  const types = metadata.types?.length ? metadata.types : ["Casual Retro Runner", "Lifestyle Basketball Sneaker", "Performance & Motorsport"];
  const sizes = metadata.sizes?.length ? metadata.sizes : ["38", "39", "40", "41", "42", "43", "44"];
  const genders = metadata.genders?.length ? metadata.genders : ["men", "women", "unisex", "kids"];

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

  const removeExistingImage = (id) => {
    setDeletedImageIds(prev => [...prev, id]);
  };

  const removeNewImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    previews.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await productService.getAdminProductById(productId);
        if (!cancelled) setProduct(p);
      } catch (e) {
        toast.error(getErrorMessage(e) || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-20 text-center text-gray-500 font-bold">Product not found</div>;
  }

  const initialValues = {
    name: product.name || "",
    brand: product.brand || "Adidas",
    type: product.type || "Casual Retro Runner",
    color: product.color || "",
    originalPrice: product.originalPrice || 0,
    costPrice: product.costPrice || 0,
    discountPercentage: product.discountPercentage || 0,
    salePrice: product.salePrice || 0,
    size: product.size || "40",
    gender: product.gender || "unisex",
    stock: product.stock ?? 0,
    isActive: product.isActive ?? true,
    description: product.description || "",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Edit product</h1>
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
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            const fd = new FormData();
            appendUpdateProduct(fd, { ...values, deleteImageIds: deletedImageIds }, selectedFiles.length ? selectedFiles : null);
            await productService.updateProduct(product.id, fd);
            toast.success("Product updated");
            navigate("/admin/productInfo");
          } catch (e) {
            toast.error(getErrorMessage(e) || "Update failed");
          } finally {
            setSubmitting(false);
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
              <div className="bg-white rounded-3xl p-8 shadow-sm border space-y-6">
                <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Basic</h2>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <Field name="name" className="w-full px-4 py-3 border rounded-xl bg-gray-50" required />
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
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
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
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border">
                  <Field type="checkbox" name="isActive" className="w-5 h-5 rounded text-indigo-600" />
                  <label className="text-sm font-bold text-gray-700">Active</label>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Pricing</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cost (₹)</label>
                      <Field name="costPrice" type="number" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
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
                      <label className="block text-sm font-bold text-indigo-600 mb-2">Sale (₹)</label>
                      <Field name="salePrice" type="number" className="w-full px-4 py-3 border rounded-xl bg-indigo-50 font-bold" readOnly />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">New images (optional)</h2>
                    <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      {previews.length} selected
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Append more photos; leave empty to keep existing.</p>
                  
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
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-gray-700">Add new images</span>
                      </div>
                    </button>
                  </div>

                  {/* Combined Preview Grid */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {/* Existing Images */}
                    {(product.images || [])
                      .filter(img => !deletedImageIds.includes(img.id))
                      .map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border group">
                          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                          
                          {/* Remove Button for Live Images */}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 w-5 h-5 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-[8px] px-1 rounded font-bold">Live</div>
                        </div>
                    ))}
                    
                    {/* New Previews */}
                    {previews.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        
                        {/* Remove Button for New Images */}
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[8px] px-1 rounded font-bold">New</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Saving…" : "Update product"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default ProductEdit;
