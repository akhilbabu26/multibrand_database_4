import { Formik,Form, Field } from "formik"
import React, { useContext } from "react"
import { LogValidation } from "./LogValidation"
import {Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../../context/AuthContext"
import toast from "react-hot-toast";



const values = {
    email: "",
    password: "",
}


export default function Login() {

  const {allUsers, setCurrentUser} = useContext(AuthContext)
  console.log(allUsers)

  const navigate = useNavigate()

  const click = (values)=>{
        
    const isExist = allUsers?.find(x => x?.email === values?.email && x?.password === values?.password)
      
     // Admin side
      if(isExist?.role === "Admin"){
        setCurrentUser(isExist)
        localStorage.setItem("user", JSON.stringify(isExist))
         toast.success(`Welcome ${isExist.name}`)
        navigate("/admin")
        return
      }

      // Role blocked true
      if(isExist?.isBlocked === true){
        return toast.error("You are blocked!") //alert("You are blocked")
      }

     // user side
      if(isExist){
        setCurrentUser(isExist)
        localStorage.setItem("user",JSON.stringify(isExist))
        toast.success(`Welcome ${isExist.name}`)
        navigate("/")
        
      }
    }

  return (
    <>  
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          /> */}
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

            <Formik
            initialValues={values}
            validationSchema={LogValidation}
            onSubmit={click}
            >

                {({errors,touched})=>(
                    <Form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <Field
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {errors.email && touched.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                            </label>
                            {/* <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div> */}
                        </div>
                        <div className="mt-2">
                            <Field
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {errors.password && touched.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Login in
                        </button>
                    </div>
            </Form>
                )}

            
            </Formik>
          

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            If your not a member?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}