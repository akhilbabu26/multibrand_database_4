import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect away if no email in state
  const email = location.state?.email
  useEffect(() => {
    if (!email) navigate('/register')
  }, [email, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // digits only
    const updated = [...otp]
    updated[index] = value.slice(-1) // only last char
    setOtp(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    const otpString = otp.join('')
    if (otpString.length < 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString })
      toast.success('Email verified! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New OTP sent!')
      setOtp(['', '', '', '', '', ''])
      setResendTimer(30)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 rounded-3xl shadow-xl border border-gray-100">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-50 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Verify Email</h2>
            <p className="text-gray-500 font-medium">We sent a 6-digit code to</p>
            <p className="text-indigo-600 font-bold mt-1">{email}</p>
          </div>

          {/* OTP Boxes */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all
                  ${digit
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-gray-50 text-gray-900'}
                  focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || otp.join('').length < 6}
            className="flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:bg-gray-300 disabled:shadow-none disabled:scale-100"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-tight transition"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm font-bold text-gray-400">
                Resend code in <span className="text-indigo-600">{resendTimer}s</span>
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-sm font-bold text-gray-400">
            Wrong email?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-tight"
            >
              Go Back
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}