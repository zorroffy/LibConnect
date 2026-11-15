
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Books from "./Books";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/books") {
    return <Books />;
  }

  return (
    <div className="container">
      <header className="navbar">
        <h1>📚 My Library</h1>

        <nav>
          <a href="/">Home</a>
          <a href="/books">Books</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </nav>
      </header>

      <main className="hero">
        <h2>Welcome to My Library</h2>

        <p>
          Discover, explore and manage
          your favourite books in one place.
        </p>

        <button onClick={() => window.location.href = "/books"}>
          Explore Books
        </button>
      </main>
    </div>
  );
}

export default App;
