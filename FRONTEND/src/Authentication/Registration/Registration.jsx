import React from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import api from '../../services/api'
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";

const Validation = Yup.object().shape({
  name: Yup.string().min(2, 'Min 2 characters').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
  cPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Required'),
})

const formValues = { name: '', email: '', password: '', cPassword: '' }

export default function Register() {
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        cPassword: values.cPassword,
      }
      await api.post('/auth/signup', payload)
      toast.success('OTP sent to your email!')
      // Pass email to verify page
      navigate('/verify-otp', { state: { email: values.email } })
    } catch (err) {
      console.error('Signup error:', err)
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-8 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500 font-medium">Join us today, it's free!</p>
          </div>

          <Formik initialValues={formValues} validationSchema={Validation} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <Field
                    id="name" name="name" type="text" placeholder="Enter your name"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  />
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <Field
                    id="email" name="email" type="email" placeholder="Enter your email"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <Field
                    id="password" name="password" type="password" placeholder="Create a password"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  />
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="cPassword" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <Field
                    id="cPassword" name="cPassword" type="password" placeholder="Confirm your password"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  />
                  {errors.cPassword && touched.cPassword && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.cPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100"
                  >
                    Sign Up
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="mt-8 text-center text-sm font-bold text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-tight">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}