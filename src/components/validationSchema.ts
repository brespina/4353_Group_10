import * as yup from "yup";


export const loginSchema = yup.object().shape({
    username: yup.string().required("Please enter your username"),
    password: yup.string().required("Please enter your password"),
});

export const registerSchema = yup.object().shape({
    username: yup
        .string()
        .required("Please enter your username")
        .matches(/^[A-Za-z0-9]+(?:[_][A-Za-z0-9]+)*$/, "Username must contain only letters, numbers, and underscores")
        .min(4, "Username must be at least 4 characters")
        .max(15, "Username must be less than 20 characters"),
    password: yup
        .string()
        .required("Please enter your password")
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be less than 50 characters")
        .matches(/^(?=.*\d)(?=.*[@$!%*?&#,])[A-Za-z\d@$!%*?&#,]{8,}$/, "Password must contain at least 1 special character and 1 number"),
});

export const profileSchema = yup.object().shape({
    full_name: yup
        .string()
        .required("Full name is required")
        .matches(/^[A-Za-z]+\s[A-Za-z]+$/, "Please enter a valid name")
        .max(50)
        .min(2),
    address1: yup
        .string()
        .required("Address must be provided")
        .max(100)
        .min(1),
    address2: yup
        .string()
        .max(100),
    city: yup
        .string()
        .required("City must be provided")
        .max(100)
        .min(1),
    state: yup
        .string()
        .required("State must be provided")
        .max(2)
        .min(2),
    zipcode: yup
        .string()
        .required("Zipcode must be provided")
        .max(9)
        .min(5),
});

export const fuel_quote_schema = yup.object().shape({
    gallons_requested: yup
        .number()
        .required("Gallons requested is required")
        .positive("Must be a positive number")
        .integer("Must be a whole number"),
    delivery_date: yup
        .date()
        .required("Delivery date is required")
});