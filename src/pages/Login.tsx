import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "../styles/fancydiv.css";
import ProfileForm from "../components/ProfileForm";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Company from "../components/Company";
import api from "../components/api";
import { useFormik } from "formik";
import { loginSchema } from "../components/validationSchema";

const Login: React.FC = () => {

  const [shouldShowProfileForm, setShouldShowProfileForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [displayBox, setDisplayBox] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      var formdata = new FormData();
      formdata.append('username', values.username);
      formdata.append('password', values.password);

      try {
        const response = await api.post('/api/token', formdata, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        });      
        const { access_token, require_details } = response.data;
  
        localStorage.setItem('token', access_token);
  
        if (require_details) {
          setShouldShowProfileForm(true);
        } else {
          navigate('/home');
        }
        return true; // Login successful
  
      } catch (error) {
        setDisplayBox(true);
        setTimeout(() => {
          setDisplayBox(false);
        }, 5000);
        return false; // Login failed
      }
    }
  });

 
  return (
    <div className="auth-page fancy-div">
      <Company />
      <div className="form">
        {shouldShowProfileForm ? (
          <ProfileForm />
        ) : (
          <>
            <h2>Sign In</h2>
            <form className="auth-form" onSubmit={formik.handleSubmit}>
              <p>Access Singh City Fuel using your username and password.</p>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="off"
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="error">{formik.errors.username}</div>
              ) : null}
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
              <button type="submit">Login</button>
              <p className="message">
                Not registered? <Link to="/register">Create an account</Link>
              </p>
            </form>
            {displayBox && (
          <div className="error-box" onClick={() => setDisplayBox(false)}>
            Invalid credentials provided!
          </div>
        )}
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
