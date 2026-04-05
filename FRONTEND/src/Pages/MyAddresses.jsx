import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import addressService from "../services/address.service";
import { getErrorMessage } from "../lib/http";
import { buildAddressUpdateBody } from "../lib/addressPayload";

const schema = Yup.object({
  full_name: Yup.string().min(2).required("Required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "10-digit mobile")
    .required("Required"),
  street: Yup.string().required("Required"),
  landmark: Yup.string(),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  pin_code: Yup.string()
    .matches(/^\d{6}$/, "6-digit PIN")
    .required("Required"),
});

const empty = {
  full_name: "",
  phone: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pin_code: "",
  is_default: false,
};

export default function MyAddresses() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await addressService.getAddresses();
      setList(rows);
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e) || "Delete failed");
    }
  };

  const onDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      toast.success("Default updated");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e) || "Update failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">My addresses</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ul className="space-y-4 mb-10">
          {list.map((a) => (
            <li key={a.id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <p className="font-semibold">{a.full_name}</p>
                <p className="text-sm text-gray-600">{a.phone}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {a.street}
                  {a.landmark ? `, ${a.landmark}` : ""}
                </p>
                <p className="text-sm text-gray-700">
                  {a.city}, {a.state} {a.pin_code}
                </p>
                {a.is_default && (
                  <span className="text-xs font-bold text-indigo-600">Default</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => onDefault(a.id)}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-100 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-bold mb-4">{editing ? "Edit address" : "Add address"}</h2>
      <Formik
        enableReinitialize
        initialValues={
          editing
            ? {
                full_name: editing.full_name,
                phone: editing.phone,
                street: editing.street,
                landmark: editing.landmark || "",
                city: editing.city,
                state: editing.state,
                pin_code: editing.pin_code,
                is_default: editing.is_default,
              }
            : empty
        }
        validationSchema={schema}
        onSubmit={async (values, { resetForm }) => {
          try {
            if (editing) {
              await addressService.updateAddress(
                editing.id,
                buildAddressUpdateBody(values)
              );
              toast.success("Address updated");
              setEditing(null);
            } else {
              await addressService.createAddress({
                ...values,
                landmark: values.landmark ?? "",
              });
              toast.success("Address added");
              resetForm();
            }
            await load();
          } catch (e) {
            toast.error(getErrorMessage(e) || "Save failed");
          }
        }}
      >
        {({ errors, touched }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-2xl p-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Full name</label>
              <Field name="full_name" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.full_name && touched.full_name && (
                <p className="text-red-500 text-xs">{errors.full_name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
              <Field name="phone" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.phone && touched.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">PIN</label>
              <Field name="pin_code" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.pin_code && touched.pin_code && (
                <p className="text-red-500 text-xs">{errors.pin_code}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Street</label>
              <Field name="street" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.street && touched.street && <p className="text-red-500 text-xs">{errors.street}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Landmark</label>
              <Field name="landmark" className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">City</label>
              <Field name="city" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.city && touched.city && <p className="text-red-500 text-xs">{errors.city}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">State</label>
              <Field name="state" className="mt-1 w-full border rounded-lg px-3 py-2" />
              {errors.state && touched.state && <p className="text-red-500 text-xs">{errors.state}</p>}
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <Field type="checkbox" name="is_default" className="rounded" />
              <span className="text-sm">Default address</span>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                {editing ? "Save changes" : "Add address"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="border px-6 py-2 rounded-xl"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
