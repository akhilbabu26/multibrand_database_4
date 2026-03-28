import React from 'react'
import { Field, Form, Formik } from 'formik'
import { Validation } from './RegValidation'
import { api } from "../../../api/Api"
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";


const formValues = {
    name: "",
    email: "",
    password: "",
    cPassword: ""
}

export default function Example() {

    const navigate = useNavigate()

    const HandleClick = async (values)=>{

        const res = await api.get("/users")
        const isExist = res.data.find(x => x.email === values.email)

        if(isExist){
            alert("User already exist")
            return;
        }
        try{
            const data = {
                name: values.name,
                email: values.email,
                password: values.password,
                cPassword: values.cPassword,
                role: "User",
                isBlocked: false,
                cart: [],
                order: [],
                wishlist:[],
                create_at: new Date().toISOString()
            }

            await api.post("/users",data)
            toast.success("Registration Successful")
            // alert()
            navigate("/login")
        }
        catch(err){
            alert(err)
        }
    }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-8 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          /> */}
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Create Your Account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">

        <Formik
        initialValues={formValues}
        validationSchema={Validation}
        onSubmit={HandleClick}
        >
            {({errors, touched})=>(
                <Form >
                    <div>
                        <label htmlFor="Username" className="mt-2 block text-sm/6 font-medium text-gray-900">
                            Create Username
                        </label>
                        <div className="mt-1">
                            <Field
                            id="Username"
                            name="name"
                            type="text"
                            autoComplete="email"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {errors.name && touched.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="mt-2 block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-1">
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
                        <label htmlFor="password" className="mt-2 block text-sm/6 font-medium text-gray-900">
                            Create Password
                        </label>
                        <div className="mt-1">
                            <Field
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="email"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {errors.password && touched.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="cPassword" className="mt-2 block text-sm/6 font-medium text-gray-900">
                            Confirm Password
                        </label>
                        <div className="mt-1">
                            <Field
                            id="cPassword"
                            name="cPassword"
                            type="Password"
                            autoComplete="email"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            {errors.cPassword && touched.cPassword && <p className="text-red-500 text-sm">{errors.cPassword}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-4"
                        >
                            Sign up
                        </button>
                    </div>

                    {/* <div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                    </div> */}
            </Form>
            )}
            
            </Formik>

          <p className="mt-4 text-center text-sm/5 text-gray-500">
            If you already a member please-
            <Link 
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500">
              Login
            </Link>
          </p>

            {/* <div>
                <small
                className="flex w-full justify-center m-2 "
                >OR</small>
                <button
                    onClick={()=> navigate("/login")}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-4"
                    >
                    Login
                </button>
             </div> */}
          
        </div>
      </div>
    </>
  )
}