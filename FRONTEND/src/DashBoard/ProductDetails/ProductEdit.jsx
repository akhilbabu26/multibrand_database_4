import React, { useEffect, useRef, useState } from "react";
import { Formik, Field, Form } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import productService from "../../services/product.service";
import { appendUpdateProduct } from "../../lib/productFormData";
import { unwrapData, getErrorMessage } from "../../lib/http";

function ProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await productService.getAdminProductById(productId);
        const p = unwrapData(raw) ?? raw;
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
    type: product.type || "Casual Retro Runner",
    color: product.color || "",
    original_price: product.original_price || 0,
    cost_price: product.cost_price || 0,
    discount_percentage: product.discount_percentage || 0,
    sale_price: product.sale_price || 0,
    size: product.size || "40",
    gender: product.gender || "unisex",
    stock: product.stock ?? 0,
    is_active: product.is_active ?? true,
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
            const files = fileRef.current?.files;
            appendUpdateProduct(fd, values, files?.length ? files : null);
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
            setFieldValue("sale_price", sale);
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <Field as="select" name="type" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      <option value="Casual Retro Runner">Retro Runner</option>
                      <option value="Lifestyle Basketball Sneaker">Basketball Sneaker</option>
                      <option value="Performance & Motorsport">Performance</option>
                      <option value="Heritage Court & Fitness">Court & Fitness</option>
                      <option value="Premium Heritage Runner">Heritage Runner</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                    <Field name="color" className="w-full px-4 py-3 border rounded-xl bg-gray-50" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <Field as="select" name="gender" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Size</label>
                    <Field as="select" name="size" className="w-full px-4 py-3 border rounded-xl bg-gray-50">
                      {["38", "39", "40", "41", "42", "43", "44"].map((s) => (
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
                  <Field type="checkbox" name="is_active" className="w-5 h-5 rounded text-indigo-600" />
                  <label className="text-sm font-bold text-gray-700">Active</label>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Pricing</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cost (₹)</label>
                      <Field name="cost_price" type="number" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Original (₹)</label>
                      <Field
                        name="original_price"
                        type="number"
                        className="w-full px-4 py-3 border rounded-xl bg-gray-50"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFieldValue("original_price", val);
                          updateSalePrice(val, values.discount_percentage);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                      <Field
                        name="discount_percentage"
                        type="number"
                        className="w-full px-4 py-3 border rounded-xl bg-gray-50"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFieldValue("discount_percentage", val);
                          updateSalePrice(values.original_price, val);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-600 mb-2">Sale (₹)</label>
                      <Field name="sale_price" type="number" className="w-full px-4 py-3 border rounded-xl bg-indigo-50 font-bold" readOnly />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">New images (optional)</h2>
                  <p className="text-sm text-gray-500">Append more photos; leave empty to keep existing.</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="w-full text-sm" />
                  <div className="flex gap-2 flex-wrap">
                    {(product.images || []).map((img) => (
                      <img key={img.id} src={img.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
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
