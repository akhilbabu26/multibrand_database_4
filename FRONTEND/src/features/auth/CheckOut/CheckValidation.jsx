import * as Yup from 'yup'

export const CheckoutValidation = Yup.object().shape({
  name: Yup.string()
  .required("Name is Required"),

  number: Yup.string()
  .required("Number is Required"),

  email: Yup.string()
  .email("Invalid email")
  .required("Invalid email"),

  address: Yup.string()
  .required("Type your Address"),

  city: Yup.string()
  .required("Type your City"),

  pinCode: Yup.string()
  .required("Type PIN code")
});