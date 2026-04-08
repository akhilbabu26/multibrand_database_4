import React, { useState, useRef, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AuthContext } from '../../Context/AuthContext'
import api from '../../services/api'
import { getErrorMessage } from '../../lib/http'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP } = useContext(AuthContext)

  // Email passed from Registration.jsx via navigate state
  const email = location.state?.email

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please sign up again.')
      navigate('/register')
    }
  }, [email, navigate])

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (index, value) => {
    // Only allow single digit
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // take last char in case of paste on single box
    setOtp(newOtp)

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // On backspace with empty box, focus previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newOtp = Array(6).fill('')
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)

    // Focus last filled box
    const lastIndex = Math.min(pasted.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const otpString = otp.join('')

    if (otpString.length < 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    try {
      await verifyOTP(email, otpString)
      toast.success('Email verified! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMessage(err) || 'OTP verification failed')
      // Clear OTP boxes on failure
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      await api.post('/auth/signup', { email, resend: true })
      toast.success('New OTP sent to your email!')
      setTimer(60)
      setCanResend(false)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to resend OTP. Try again.')
    }
  }

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-8 lg:px-8 bg-gray-50 relative">
      {/* Premium Floating Back Button */}
      <button 
        onClick={() => navigate('/register')}
        className="fixed top-6 left-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 hover:bg-gray-50 transition-all group active:scale-95"
        title="Back to Registration"
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
              Verify your email
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          {/* OTP Boxes */}
          <div className="flex gap-2 justify-center mb-6">
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
                onPaste={handlePaste}
                className="w-11 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join('').length < 6}
            className="flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition transform active:scale-95 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Didn't receive it?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Resend OTP
              </button>
            ) : (
              <span className="font-semibold text-gray-400">
                Resend in {formatTimer(timer)}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}