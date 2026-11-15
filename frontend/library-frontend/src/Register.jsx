import { useState } from "react";
import { api, saveSession } from "./api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      saveSession(data.token, data.user);
      window.location.href = "/books";
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="login-container">
      <h2>Create Account</h2>

      <p>Register for your library account</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Register
        </button>
      </form>

      <p>
        Already have an account?
        <a href="/login"> Login here</a>
      </p>
    </div>
  );
}

export default Register;
