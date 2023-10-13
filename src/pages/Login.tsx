import React, { FormEvent, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "../styles/fancydiv.css";
import ProfileForm from "../components/ProfileForm";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Company from "../components/Company";
import api from "../components/api";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shouldShowProfileForm, setShouldShowProfileForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [displayBox, setDisplayBox] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    var formdata = new FormData();
    formdata.append('username', username);
    formdata.append('password', password);

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
  };

 
  return (
    <div className="auth-page fancy-div">
      <Company />
      <div className="form">
        {shouldShowProfileForm ? (
          <ProfileForm />
        ) : (
          <>
            <h2>Sign In</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
              <p>Access Singh City Fuel using your username and password.</p>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="password-input">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
