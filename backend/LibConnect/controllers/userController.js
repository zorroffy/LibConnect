const User = require('../models/User');
const { isValidId, isString, validationResponse } = require('../utils/helpers');

const ROLES = ['member', 'librarian', 'admin'];

// GET /api/users  (admin)
exports.listUsers = async (req, res, next) => 
{
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id  (admin, or the user themself)
exports.getUserById = async (req, res, next) => 
{
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid user id' });
    if (req.user.role !== 'admin' && req.userId.toString() !== id) {
      return res.status(403).json({ error: 'No permission: Only the account owner or an admin can view this profile' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (admin creates a user with any role)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (![name, email, password].every(isString)) {
      return res.status(400).json({ error: 'name, email and password are required strings' });
    }
    if (role !== undefined && !ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
    }
    const user = await User.create({ name, email, password, role });
    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id  (admin, or the user themself; only an admin can change a role)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid user id' });

    const adminUser = req.user.role === 'admin';
    if (!adminUser && req.userId.toString() !== id) {
      return res.status(403).json({ error: 'No permission: Only the account owner or an admin can update this profile' });
    }

    const { name, email, password, role } = req.body || {};
    for (const [key, val] of Object.entries({ name, email, password })) {
      if (val !== undefined && !isString(val)) return res.status(400).json({ error: `${key} must be a string` });
    }
    if (role !== undefined && !ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
    }
    if ([name, email, password, role].every((val) => val === undefined)) {
      return res.status(400).json({ error: 'Body must include at least one of: name, email, password, role' });
    }

    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password !== undefined) user.password = password; // re-hashed by the pre-save hook
    if (role !== undefined && adminUser) user.role = role;

    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid user id' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.deleteOne();
    return res.status(200).json({ message: 'User deleted', id });
  } catch (err) {
    next(err);
  }
};
