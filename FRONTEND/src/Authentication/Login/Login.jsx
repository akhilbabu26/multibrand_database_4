import { Formik, Form, Field } from "formik"
import React, { useContext, useState } from "react"
import { LogValidation } from "./LogValidation"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../Context/AuthContext"
import toast from "react-hot-toast"
import { getErrorMessage } from "../../lib/http"

const values = {
  email: "",
  password: "",
}

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const handleLogin = async (values) => {
    setIsLoading(true)
    try {
      if (!login) {
        toast.error("Authentication context not available")
        setIsLoading(false)
        return
      }

      const response = await login(values.email, values.password)
      toast.success(`Welcome!`)

      const role = String(response?.user?.role ?? "").toLowerCase()

      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        <Formik
          initialValues={values}
          validationSchema={LogValidation}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6">

              {/* Email */}
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
                />
                {errors.email && touched.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent border-b border-white/50 py-2 text-white placeholder-white/70 focus:outline-none"
                />
                {errors.password && touched.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Options */}
              <div className="flex justify-between text-sm text-white/80">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-white" />
                  Remember me
                </label>

                <Link to="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Log in"}
              </button>

            </Form>
          )}
        </Formik>

        {/* Register */}
        <p className="text-center text-sm mt-6 text-white/70">
          Don’t have an account?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}