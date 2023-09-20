import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginProps {
  loginHandler: (username: string, password: string) => void;
}


const Login: React.FC<LoginProps> = ({ loginHandler }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (s: FormEvent) => {
    s.preventDefault();
    navigate("/profile");
    loginHandler(username, password); // TODO : implement auth
  };

  return (
    <div className="login-page">
      <div className="form">
        <h1>Sign In</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            required
            value={username}
            onChange={(s) => setUsername(s.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            required
            value={password}
            onChange={(s) => setPassword(s.target.value)}
          />
          <button type="submit">Login</button>
          <p className="message">
            Not registered? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
