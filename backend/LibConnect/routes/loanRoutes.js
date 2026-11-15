const router = require('express').Router();
const loanController = require('../controllers/loanController');
const { requireAuth, authorize } = require('../middleware/auth');

router.use(requireAuth);

// NOTE: `/mine` is declared BEFORE `/:id` so Express doesn't treat
// the literal string "mine" as an :id value.
router.get('/mine', loanController.listMyLoans); //                                     GET    /api/loans/mine
router.get('/', loanController.listLoans); //                                           GET    /api/loans
router.post('/', loanController.createLoan); //                                         POST   /api/loans
router.get('/:id', loanController.getLoanById); //                                      GET    /api/loans/:id
router.put('/:id', authorize('librarian', 'admin'), loanController.updateLoan); //      PUT    /api/loans/:id
router.delete('/:id', authorize('librarian', 'admin'), loanController.deleteLoan); //   DELETE /api/loans/:id

module.exports = router;
