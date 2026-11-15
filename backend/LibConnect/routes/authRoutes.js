const router = require('express').Router();
const { signup, signin, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', signup); // POST /api/auth/signup
router.post('/signin', signin); // POST /api/auth/signin
router.get('/me', requireAuth, me); // GET  /api/auth/me

module.exports = router;
