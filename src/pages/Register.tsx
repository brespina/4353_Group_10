import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface RegisterProps {
  addUser: (username: string, password: string) => void;
}

const Register: React.FC<RegisterProps> = ({ addUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (s: FormEvent) => {
    s.preventDefault();
    navigate("/login");
    addUser(username, password); 
  };

  return (
    <div className="register-page">
      <h1>Register</h1>
      <form className="register-form" onSubmit={handleSubmit}>
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
        <button>Sign Up</button>
        <p className="message">
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
