// ============================================================================
// Book Controller
//   200 OK            successful GET / PUT / DELETE
//   201 Created       successful POST
//   400 Bad Request   invalid id, invalid filter, failed validation, empty body
//   401 / 403         handled by requireAuth / authorize middleware
//   404 Not Found     no book with that id
// ============================================================================
const Book = require('../models/Book');
const { isString, isValidId, pick, validationResponse } = require('../utils/helpers');

// createdBy, _id, createdAt and updatedAt can never be set from the body
const WRITABLE_FIELDS = ['title', 'author', 'isbn', 'genre', 'category', 'description', 'copiesAvailable'];
const STRING_FIELDS = ['title', 'author', 'isbn', 'genre', 'category', 'description'];

function typeProblem(data) 
{
  for (const field of STRING_FIELDS) {
    if (field in data && !isString(data[field])) return `${field} must be a string`;
  }
  if ('copiesAvailable' in data && (typeof data.copiesAvailable !== 'number' || data.copiesAvailable < 0)) {
    return 'copiesAvailable must be a number, 0 or more';
  }
  return null;
}

// GET /api/books  - any signed-in user; optional ?genre= and ?author= filters
exports.listBooks = async (req, res, next) =>
 {
  try {
    const filter = {};
    for (const field of ['genre', 'author']) {
      if (req.query[field] !== undefined) {
        if (!isString(req.query[field])) return res.status(400).json({ error: `${field} must be a string` });
        filter[field] = req.query[field];
      }
    }
    const allBooks = await Book.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(allBooks);
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => 
{
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid book id' });
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
};

// POST /api/books  (librarian, admin) - createdBy is ALWAYS the signed-in user
exports.createBook = async (req, res, next) => {
  try {
    const newBook = pick(req.body, WRITABLE_FIELDS);
    const typeError = typeProblem(newBook);
    if (typeError) return res.status(400).json({ error: typeError });

    const book = await Book.create({ ...newBook, createdBy: req.userId });
    return res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id  (librarian, admin)
exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid book id' });

    const bookChanges = pick(req.body, WRITABLE_FIELDS);
    if (Object.keys(bookChanges).length === 0) {
      return res.status(400).json({
        error: `Request body must include at least one updatable field: ${WRITABLE_FIELDS.join(', ')}`,
      });
    }
    const typeError = typeProblem(bookChanges);
    if (typeError) return res.status(400).json({ error: typeError });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // set() + save() (not findByIdAndUpdate) so schema validators run on every field
    book.set(bookChanges);
    await book.save();
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id  (librarian, admin)
exports.deleteBook = async (req, res, next) => 
{
  
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid book id' });
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.deleteOne();
    return res.status(200).json({ message: 'Book deleted', id });
  } catch (err) {
    next(err);
  }
};
