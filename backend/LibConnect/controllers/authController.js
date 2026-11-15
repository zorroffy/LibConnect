const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) 
{
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// POST /api/auth/signup  (role is always "member"; an admin promotes users later)
exports.signup = async (req, res, next) => 
{
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email & password required' });
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'name, email & password need to be strings' });
    }

    const foundUser = await User.findOne({ email: email.toLowerCase() });
    if (foundUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = await User.create({ name, email, password });
    return res.status(201).json({ token: signToken(newUser), user: newUser });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signin
exports.signin = async (req, res, next) => 
{
  try {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'email and password  required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email/password' });
    }

    return res.status(200).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = (req, res) => res.status(200).json({ user: req.user });
