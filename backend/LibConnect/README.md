# LibConnect - Library API

This is the backend for LibConnect, a library app where members can browse and borrow books. It is built for COMP229 Project Part 1 (First Release).

**Built with:** Node.js, Express, MongoDB (Mongoose), JWT login, and role-based permissions. The code is organized as MVC (models, controllers, routes).

## 1. How to run it

Step 1: install the packages.

    npm install

Step 2: copy .env.example to a new file called .env and fill it in.

    PORT=5001
    MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/libconnect
    JWT_SECRET=any_long_random_text
    JWT_EXPIRES_IN=1d

Step 3: start the server.

    npm run dev

If it works, the terminal shows:

    [db] Connected to MongoDB: libconnect
    [server] Listening on http://localhost:5001

Note: the server restarts by itself when you save a code file, but not when you change .env. If you edit .env, stop the server (Control + C) and run npm run dev again.

Quick checks in the browser: http://localhost:5001/healthz should show {"status":"ok"}, and http://localhost:5001/api lists the endpoints.

## 2. Project folders

    server.js               starts the server and connects to MongoDB
    app.js                  sets up Express, the routes and the error handlers
    config/db.js            connects to the database
    middleware/auth.js      checks the login token and the user's role
    middleware/errorHandlers.js   handles 404 and other errors
    models/                 User, Book and Loan
    controllers/            the code behind each route (auth, user, book, loan)
    routes/                 the URLs for each controller
    utils/helpers.js        small helper functions
    LibConnect-API.postman_collection.json   our API tests

## 3. User roles

- **member** (the default when you sign up): browse books, borrow, see their own loans, edit their own profile
- **librarian**: everything a member can do, plus add, edit and delete books and manage loans
- **admin**: everything, including managing users and roles

Signing up always creates a member. To make the first admin, sign up normally, then open the user in MongoDB Atlas (Browse Collections) and change role to "admin".

## 4. API endpoints

Base URL: http://localhost:5001/api

Most routes need a login token. Send it in the header: Authorization: Bearer your-token. You get the token from signup or signin.

### Auth
| Method | URL | Who | Body |
|---|---|---|---|
| POST | /auth/signup | anyone | name, email, password |
| POST | /auth/signin | anyone | email, password |
| GET | /auth/me | signed in | none |

Signup and signin both reply with { "token": "...", "user": { ... } }.

### Users
| Method | URL | Who |
|---|---|---|
| GET | /users | admin |
| POST | /users | admin |
| GET | /users/:id | admin, or the user themselves |
| PUT | /users/:id | admin, or the user themselves (only an admin can change role) |
| DELETE | /users/:id | admin |

### Books
| Method | URL | Who |
|---|---|---|
| GET | /books (can filter with ?genre= or ?author=) | any signed-in user |
| GET | /books/:id | any signed-in user |
| POST | /books | librarian, admin |
| PUT | /books/:id | librarian, admin |
| DELETE | /books/:id | librarian, admin |

### Loans
| Method | URL | Who |
|---|---|---|
| POST | /loans (send book and dueDate) | any signed-in user. Available copies go down by 1 |
| GET | /loans | staff see all loans, members see only their own |
| GET | /loans/mine | your own loans |
| GET | /loans/:id | the owner, or staff |
| PUT | /loans/:id (send status: "returned" or a new dueDate) | librarian, admin. Returning a book adds a copy back |
| DELETE | /loans/:id | librarian, admin |

### Status codes we use
| Code | When |
|---|---|
| 200 | success for GET, PUT, DELETE |
| 201 | success for POST (something was created) |
| 400 | bad request: invalid id, missing or wrong fields |
| 401 | not logged in, or the token is missing or invalid |
| 403 | logged in, but your role is not allowed (or it is not your loan) |
| 404 | not found |
| 409 | that email is already registered |
| 500 | unexpected server error |

### Data fields
- **User:** name, email (must be unique), password (stored hashed and never sent back), role
- **Book:** title, author, isbn (unique), genre, category, description, copiesAvailable, createdBy (set by the server)
- **Loan:** book, user, borrowedAt, dueDate, returnedAt, status (borrowed, returned or overdue)

## 5. Testing with Postman

1. Import LibConnect-API.postman_collection.json into Postman.
2. Set the baseUrl variable to http://localhost:5001/api.
3. Run the folders in order: 1 Auth, 2 Books, 3 Loans, 4 Admin, 5 Permission checks.
4. Each request has a test that checks the status code, so the results show green (pass) or red (fail).

Before running folder 2, make an admin account (see section 3) and run "Signin ADMIN" so the collection has an admin token.