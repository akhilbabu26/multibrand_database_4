import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/http';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: values.email });
      toast.success('OTP sent to your email!');
      // Pass email to reset-password page so it pre-fills
      navigate('/reset-password', { state: { email: values.email } });
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 relative">
      {/* Premium Floating Back Button */}
      <button 
        onClick={() => navigate('/login')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 hover:bg-gray-50 transition-all group active:scale-95"
        title="Back to Login"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-700 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-500 font-medium">
              No worries, we'll send an OTP to your email.
            </p>
          </div>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your registered email"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="mt-8 text-center text-sm font-bold text-gray-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-tight">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;