const { Router } = require('express');
const userController = require('../controllers/user.controller');
const registrationController = require('../controllers/registration.controller');
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const router = Router();

// Gestion de usuarios: solo administradores pueden listar o eliminar
router.get('/', protect, authorize('admin'), userController.listUsers);

// Inscripciones del usuario autenticado (la identidad sale del JWT, nunca de la URL)
router.get('/me/registrations', protect, registrationController.listMyRegistrations);

// Favoritos del usuario autenticado (misma razon que /me/registrations: antes de /:id)
router.get('/me/favorites', protect, favoriteController.listMyFavorites);

router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
