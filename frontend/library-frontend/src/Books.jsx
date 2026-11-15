
import { useState } from "react";
import { useEffect } from "react";
import { api, clearSession, getUser } from "./api";

function Books() {
  const [books, setBooks] = useState([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    api("/books")
      .then(data => setBooks(data))
      .catch(err => alert(err.message));
  }, []);

  async function addBook(e) {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      alert("Please enter book title and author.");
      return;
    }

    try {
      const newBook = await api("/books", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category: "General",
          description: "No description available."
        })
      });

      setBooks([...books, newBook]);
      setTitle("");
      setAuthor("");
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteBook(id) {
    try {
      await api(`/books/${id}`, { method: "DELETE" });
      setBooks(books.filter(book => book.id !== id));
      setSelectedBook(null);
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(book) {
    setEditingBook({ ...book });
    setSelectedBook(null);
  }

  async function saveChanges(e) {
    e.preventDefault();

    if (!editingBook.title.trim() || !editingBook.author.trim()) {
      alert("Please enter book title and author.");
      return;
    }

    try {
      await api(`/books/${editingBook.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingBook.title.trim(),
          author: editingBook.author.trim(),
          category: editingBook.category,
          description: editingBook.description
        })
      });
    } catch (err) {
      alert(err.message);
      return;
    }

    setBooks(
      books.map(book =>
        book.id === editingBook.id
          ? {
              ...editingBook,
              title: editingBook.title.trim(),
              author: editingBook.author.trim()
            }
          : book
      )
    );

    setEditingBook(null);
    alert("Book updated successfully!");
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="books-container">
      <p>
        Signed in as {getUser()?.name} | <a href="/">Home</a> | <a href="/login" onClick={() => clearSession()}>Sign out</a>
      </p>

      <h2>Available Books</h2>
      <p>Explore our library collection.</p>

      <h3>Add a New Book</h3>

      <form onSubmit={addBook} className="add-book-form">
        <input
          placeholder="Enter book title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          placeholder="Enter author name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />

        <button type="submit">Add Book</button>
      </form>

      {editingBook && (
        <div className="edit-book-form">
          <h3>Edit Book</h3>

          <form onSubmit={saveChanges} className="add-book-form">
            <input
              placeholder="Book title"
              value={editingBook.title}
              onChange={e =>
                setEditingBook({
                  ...editingBook,
                  title: e.target.value
                })
              }
            />

            <input
              placeholder="Author name"
              value={editingBook.author}
              onChange={e =>
                setEditingBook({
                  ...editingBook,
                  author: e.target.value
                })
              }
            />

            <input
              placeholder="Category"
              value={editingBook.category}
              onChange={e =>
                setEditingBook({
                  ...editingBook,
                  category: e.target.value
                })
              }
            />

            <textarea
              placeholder="Book description"
              value={editingBook.description}
              onChange={e =>
                setEditingBook({
                  ...editingBook,
                  description: e.target.value
                })
              }
            />

            <button type="submit">Save Changes</button>

            <button
              type="button"
              onClick={() => setEditingBook(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <h3>Search Books</h3>

      <input
        className="search-input"
        placeholder="Search by title or author"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="book-list">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div className="book-card" key={book.id}>
              <h3>{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>Category: {book.category}</p>

              <button onClick={() => setSelectedBook(book)}>
                View Details
              </button>

              <button onClick={() => startEdit(book)}>
                Edit Book
              </button>

              <button
                className="delete-button"
                onClick={() => deleteBook(book.id)}
              >
                Delete Book
              </button>
            </div>
          ))
        ) : (
          <p>No books found.</p>
        )}
      </div>

      {selectedBook && (
        <div className="details-modal">
          <div className="details-box">
            <h2>{selectedBook.title}</h2>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Category:</strong> {selectedBook.category}</p>
            <p><strong>Description:</strong> {selectedBook.description}</p>

            <button onClick={() => setSelectedBook(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
