import React, { FormEvent, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import ProfileForm from "../components/ProfileForm";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface LoginProps {
  loginHandler: (username: string, password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ loginHandler }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shouldShowProfileForm, setShouldShowProfileForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isLoginSuccessful = true;

    if (isLoginSuccessful) {
      const isProfileComplete = false;
      if (!isProfileComplete) {
        setShouldShowProfileForm(true);
      }
    }
  };

  return (
    <div className="auth-page">
      <h1 className="company-name">Singh City Fuel</h1>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
