import * as Yup from 'yup'


export const LogValidation = Yup.object({
    email: Yup.string()
    .email("Type your email")
    .required("Email is required"),

    password: Yup.string()
    .required("Password is required")
})