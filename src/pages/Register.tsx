import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "../styles/fancydiv.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Company from "../components/Company";
import api from "../components/api";
import { useFormik } from "formik";
import { registerSchema } from "../components/validationSchema";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        const response = await api.post(
          "/api/register",
          {
            username: values.username,
            password: values.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          setDisplayBox(true);
          setDisplayMessage("Successfully signed up! Redirecting...");
          setTimeout(() => {
            navigate("/");
            setDisplayBox(false);
          }, 1500);
        }
      } catch (error) {
        setDisplayBox(true);
        setDisplayMessage("Registration failed. Try a different username.");
        setTimeout(() => {
          setDisplayBox(false);
        }, 5000);
      }
    },
  });

  return (
    <div className="auth-page fancy-div">
      <Company />
      <div className="form">
        <h2>Register</h2>
        <p>Create a new Singh City Fuel account</p>
        <form className="auth-form" onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              required
              value={formik.values.username}
              onChange={formik.handleChange}
              autoComplete="off"
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="error">{formik.errors.username}</div>
            ) : null}
          </div>
          <div className="password-input">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              required
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="off"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error">{formik.errors.password}</div>
            ) : null}
            <span
              className="password-icon-container"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className="password-icon" />
              ) : (
                <FaEyeSlash className="password-icon" />
              )}
            </span>
          </div>
          <button>Sign Up</button>
          <p className="message">
            Already registered? <Link to="/">Sign In</Link>
          </p>
        </form>
        {displayBox && (
          <div
            className={`notification-box ${
              displayMessage === "Successfully signed up! Redirecting..."
                ? "success-box"
                : "error-box"
            }`}
            onClick={() => setDisplayBox(false)}
          >
            {displayMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
