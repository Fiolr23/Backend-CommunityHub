const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const router = Router();

// Gestion de usuarios: solo administradores pueden listar o eliminar
router.get('/', protect, authorize('admin'), userController.listUsers);
router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
