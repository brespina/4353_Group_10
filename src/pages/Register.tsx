import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "../styles/fancydiv.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Company from "../components/Company";
import api from "../components/api";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [displayBox, setDisplayBox] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

  const handleSubmit = async (s: FormEvent) => {
    s.preventDefault();
    try {
      const response = await api.post(
        "/api/register",
        {
          username,
          password,
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
      setDisplayMessage("Registration failed.");
      setTimeout(() => {
        setDisplayBox(false);
      }, 5000);
    }
  };

  return (
    <div className="auth-page fancy-div">
      <Company />
      <div className="form">
        <h2>Register</h2>
        <p>Create a new Singh City Fuel account</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(s) => setUsername(s.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="password-input">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(s) => setPassword(s.target.value)}
              autoComplete="off"
              minLength={8}
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
