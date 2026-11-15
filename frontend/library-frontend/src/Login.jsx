import { useState } from "react";
import { api, saveSession } from "./api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await api("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      saveSession(data.token, data.user);
      window.location.href = "/books";
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="login-container">
      <h2>Welcome Back!</h2>
      <p>Login to your library account</p>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account?
        <a href="/register"> Register here</a>
      </p>
    </div>
  );
}

export default Login;
