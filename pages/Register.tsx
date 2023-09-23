import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Company from "../components/Company";

interface RegisterProps {
  addUser: (username: string, password: string) => void;
}

const Register: React.FC<RegisterProps> = ({ addUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (s: FormEvent) => {
    s.preventDefault();
    navigate("/");
    addUser(username, password);
  };

  return (
    <div className="auth-page">
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
      </div>
    </div>
  );
};

export default Register;