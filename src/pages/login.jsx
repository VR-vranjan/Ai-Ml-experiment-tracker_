import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const auth = getAuth(app);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signuser = () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Login Success!!");
        navigate("/landing");
      })
      .catch((error) => {
        console.error("Login Error:", error);
        alert(`Login failed: ${error.message}`);
      });
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <label>Email:</label>
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        placeholder="Write Email here..."
      />
      <label>Password:</label>
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        placeholder="Password here..."
      />
      <button onClick={signuser}>Login</button>
      <p>
        Don't have an account? <Link to="/">Signup</Link>
      </p>
    </div>
  );
};

export default Login;
