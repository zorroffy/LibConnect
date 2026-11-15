const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication: verify the JWT, load the user, attach req.user / req.userId
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [type, loginToken] = auth.split(' ');

    if (type !== 'Bearer' || !loginToken) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const tokenData = jwt.verify(loginToken, process.env.JWT_SECRET);
    const user = await User.findById(tokenData.sub);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
}

// Authorization: allow only the listed roles (member, librarian, admin)
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Forbidden: role '${req.user.role}' is not allowed to do this` });
  }
  next();
};

module.exports = { requireAuth, authorize };
