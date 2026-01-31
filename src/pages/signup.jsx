import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const auth = getAuth(app);

const Signup = () => {
  const [email, setEmail] = useState(" ");
  const [password, setPassword] = useState(" ");
  const navigate = useNavigate();

  const createUser = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((value) => {
        alert("Succes!!");
        navigate("/landing");
      })
      .catch((err) => console.log(error));
  };
  return (
    <>
      <div className="Signup-page">
        <h1>Signup</h1>
        <label>Email:</label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          required
          placeholder="Write email here..."
        />
        <label>Password</label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          required
          placeholder="write password here.."
        />
        <button type="button" onClick={createUser}>
          Signup
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </>
  );
};

export default Signup;
