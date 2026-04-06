import React, { useRef, useState } from "react";
import { Formik, Field, Form } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import productService from "../../services/product.service";
import { appendCreateProduct } from "../../lib/productFormData";
import { getErrorMessage } from "../../lib/http";

const initialValues = {
  name: "",
  brand: "Adidas",
  type: "Casual Retro Runner",
  color: "",
  original_price: 0,
  cost_price: 0,
  discount_percentage: 0,
  sale_price: 0,
  size: "40",
  gender: "unisex",
  stock: 0,
  description: "",
};

function AddProduct() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

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
          const files = fileRef.current?.files;
          if (!files?.length) {
            toast.error("Add at least one product image");
            return;
          }
          setSubmitting(true);
          sf(true);
          try {
            const fd = new FormData();
            appendCreateProduct(fd, values, files);
            await productService.createProduct(fd);
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
            setFieldValue("sale_price", sale);
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
                      <option value="Adidas">Adidas</option>
                      <option value="Nike">Nike</option>
                      <option value="Puma">Puma</option>
                      <option value="Reebok">Reebok</option>
                      <option value="New Balance">New Balance</option>
                    </Field>
                  </div>
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
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Pricing</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cost (₹)</label>
                      <Field name="cost_price" type="number" step="0.01" className="w-full px-4 py-3 border rounded-xl bg-gray-50" />
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

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">Images</h2>
                  <p className="text-sm text-gray-500">Upload one or more files (required). First image becomes primary.</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="w-full text-sm" />
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
