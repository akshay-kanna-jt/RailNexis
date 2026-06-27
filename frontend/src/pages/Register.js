import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password
      });

      if (res.data.user) {
        localStorage.setItem("userId", res.data.user._id);
      }

      alert("User registered successfully");

    } catch (error) {
      alert("Registration failed");
    }
  };

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h2 style={styles.title}>RailNexis Register</h2>

        <form onSubmit={handleRegister}>

          <input
            style={styles.input}
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit">
            Register
          </button>

          <p style={{ marginTop: "15px" }}>
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </p>

        </form>

      </div>

    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Register;