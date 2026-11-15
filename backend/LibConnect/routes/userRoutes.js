const router = require('express').Router();
const userController = require('../controllers/userController');
const { requireAuth, authorize } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', authorize('admin'), userController.listUsers); //        GET    /api/users
router.post('/', authorize('admin'), userController.createUser); //      POST   /api/users
router.get('/:id', userController.getUserById); //                       GET    /api/users/:id   (admin or self)
router.put('/:id', userController.updateUser); //                        PUT    /api/users/:id   (admin or self)
router.delete('/:id', authorize('admin'), userController.deleteUser); // DELETE /api/users/:id

module.exports = router;
