const router = require('express').Router();
const bookController = require('../controllers/bookController');
const { requireAuth, authorize } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', bookController.listBooks); //                                          GET    /api/books
router.get('/:id', bookController.getBookById); //                                     GET    /api/books/:id
router.post('/', authorize('librarian', 'admin'), bookController.createBook); //       POST   /api/books
router.put('/:id', authorize('librarian', 'admin'), bookController.updateBook); //     PUT    /api/books/:id
router.delete('/:id', authorize('librarian', 'admin'), bookController.deleteBook); //  DELETE /api/books/:id

module.exports = router;
