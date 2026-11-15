// ============================================================================
// Loan Controller - borrowing and returning books
//   Members: borrow for themselves, see only their own loans
//   Librarians / admins: see and manage every loan
// ============================================================================
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const { isString, isValidId } = require('../utils/helpers');

const STATUSES = ['borrowed', 'returned', 'overdue'];
const isStaff = (user) => user.role === 'librarian' || user.role === 'admin';
const populate = (query) => query.populate('book', 'title author').populate('user', 'name email');

// POST /api/loans - borrow a book (staff may borrow on behalf of "user")
exports.createLoan = async (req, res, next) => 
{

  try {
    const { book: bookId, dueDate, user: requestedUserId } = req.body || {};
    if (!isValidId(bookId)) return res.status(400).json({ error: 'A valid book id is required' });
    if (!isString(dueDate) || Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'A valid dueDate is required (e.g. 2026-12-31)' });
    }
    if (isStaff(req.user) && requestedUserId !== undefined && !isValidId(requestedUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    const borrowerId = isStaff(req.user) && requestedUserId ? requestedUserId : req.userId;

    const foundBook = await Book.findById(bookId);
    if (!foundBook) return res.status(404).json({ error: 'Book not found' });
    if (foundBook.copiesAvailable < 1) return res.status(400).json({ error: 'No copies available' });

    const loan = await Loan.create({ book: bookId, user: borrowerId, dueDate });
    foundBook.copiesAvailable -= 1;
    await foundBook.save();

    return res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
};

// GET /api/loans - staff see all, members see their own
exports.listLoans = async (req, res, next) => 
{

  try {
    const filter = isStaff(req.user) ? {} : { user: req.userId };
    const loanList = await populate(Loan.find(filter).sort({ createdAt: -1 }));
    return res.status(200).json(loanList);
  } catch (err) {
    next(err);
  }
};

// GET /api/loans/mine - the signed-in user's own loans
exports.listMyLoans = async (req, res, next) =>
 {

  try {
    const loanList = await populate(Loan.find({ user: req.userId }).sort({ createdAt: -1 }));
    return res.status(200).json(loanList);
  } catch (err) {
    next(err);
  }
};

// GET /api/loans/:id - owner or staff
exports.getLoanById = async (req, res, next) =>
 {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid loan id' });
    const loan = await populate(Loan.findById(id));
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (!isStaff(req.user) && loan.user._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'No permission: this is not your loan' });
    }
    return res.status(200).json(loan);
  } catch (err) {
    next(err);
  }
};

// PUT /api/loans/:id - staff: change due date or mark returned
exports.updateLoan = async (req, res, next) =>
 {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid loan id' });

    const { dueDate, status } = req.body || {};
    if (dueDate === undefined && status === undefined) {
      return res.status(400).json({ error: 'Request body must include dueDate or status' });
    }
    if (dueDate !== undefined && (!isString(dueDate) || Number.isNaN(Date.parse(dueDate)))) {
      return res.status(400).json({ error: 'dueDate must be a valid date' });
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }

    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (dueDate !== undefined) loan.dueDate = dueDate;
    if (status === 'returned' && loan.status !== 'returned') {
      loan.status = 'returned';
      loan.returnedAt = new Date();
      await Book.findByIdAndUpdate(loan.book, { $inc: { copiesAvailable: 1 } });
    } else if (status !== undefined && status !== 'returned') {
      loan.status = status;
    }
    await loan.save();
    return res.status(200).json(loan);
  } catch (err) {
    next(err);
  }
};




// DELETE /api/loans/:id - staff
exports.deleteLoan = async (req, res, next) => 
{
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid loan id' });
    const loan = await Loan.findById(id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (loan.status !== 'returned') {
      await Book.findByIdAndUpdate(loan.book, { $inc: { copiesAvailable: 1 } });
    }
    await loan.deleteOne();
    return res.status(200).json({ message: 'Loan deleted', id });
  } catch (err) {
    next(err);
  }
};
