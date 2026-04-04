import React, { useState, useContext  } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import { AuthContext } from '../../Context/AuthContext';

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  otp: Yup.string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must be numeric')
    .required('Required'),
  new_password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords do not match')
    .required('Required'),
});

function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useContext(AuthContext)

  // Pre-fill email if passed via navigation state from ForgotPassword page
  const prefillEmail = location.state?.email || '';

const handleSubmit = async (values) => {
  setIsSubmitting(true);
  try {
    await resetPassword(
      values.email.trim(),
      values.otp.trim(),        // ← trim whitespace
      values.new_password,
      values.confirm_password
    );
    toast.success('Password reset successfully!');
    setTimeout(() => navigate('/login'), 2000);
  } catch (error) {
    // error from AuthContext is err.message but backend sends { errors: [...] }
    const backendErrors = error?.errors
    if (backendErrors?.length) {
      backendErrors.forEach(e => toast.error(`${e.field}: ${e.message}`))
    } else {
      toast.error(error?.message || 'Failed to reset password')
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const EyeIcon = ({ show }) => (
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  );

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Reset Password</h2>
            <p className="text-gray-500 font-medium">Enter the OTP sent to your email and set a new password.</p>
          </div>

          <Formik
            initialValues={{
              email: prefillEmail,
              otp: '',
              new_password: '',
              confirm_password: '',
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-5">
                {/* Email */}
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
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.email}</p>
                  )}
                </div>

                {/* OTP */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    OTP Code
                  </label>
                  <Field
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none tracking-widest text-center text-lg font-bold"
                  />
                  {errors.otp && touched.otp && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.otp}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new_password" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Field
                      id="new_password"
                      name="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="block w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <EyeIcon show={showNewPassword} />
                    </button>
                  </div>
                  {errors.new_password && touched.new_password && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.new_password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      className="block w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>
                  {errors.confirm_password && touched.confirm_password && (
                    <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tight">{errors.confirm_password}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword;