const mongoose = require('mongoose');

/** A body/query value must be a plain string (blocks NoSQL operator injection like ?genre[$ne]=x). */
const isString = (val) => typeof val === 'string';

/** True only for a 24-hex-character Mongo ObjectId. */
const isValidId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id) && /^[a-fA-F0-9]{24}$/.test(id);

/** Copy only whitelisted fields from a request body. */
function pick(body, allowedFields) {
  const result = {};
  if (body && typeof body === 'object') {
    for (const field of allowedFields) {
      if (field in body) result[field] = body[field];
    }
  }
  return result;
}

/** Turn a Mongoose ValidationError into a readable 400 payload. */
function validationResponse(res, err) {
  const problems = Object.values(err.errors).map((error) => error.message);
  return res.status(400).json({ error: 'Validation failed', details: problems });
}

module.exports = { isString, isValidId, pick, validationResponse };
