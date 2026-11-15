const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    isbn: { type: String, unique: true, sparse: true, trim: true },
    genre: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    copiesAvailable: { type: Number, default: 1, min: [0, 'copiesAvailable cannot be negative'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Book', bookSchema);
