import * as Yup from 'yup'

export const Validation = Yup.object({
    name: Yup.string()
    .min(3, "Username must contain at least 3 characters")
    .required("Please type a username"),

    email: Yup.string()
    .email("Enter a valid email")
    .required("Please Enter Your email"),

    password: Yup.string()
    .min(6, "Password must contain at least 6 characters")
    .required("Please create a password"),

    cPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password is not matched")
    .required("Please confirm your password ")
})