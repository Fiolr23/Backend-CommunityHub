const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// Cada organizador ve solo sus notificaciones
router.get('/', protect, notificationController.listNotifications);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;
