const { Router } = require('express');
const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const router = Router();

// Consulta de actividades: publica, cualquiera puede ver
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);

// Crear: organizer y admin
router.post('/', protect, authorize('organizer', 'admin'), eventController.createEvent);

// Editar/eliminar: el dueno o el admin. El chequeo de "es el dueno" esta en event.service.js
router.put('/:id', protect, authorize('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), eventController.deleteEvent);

// Inscripcion a la actividad: cualquier usuario autenticado puede inscribirse/cancelar su propia inscripcion
router.post('/:id/register', protect, registrationController.register);
router.delete('/:id/register', protect, registrationController.unregister);

module.exports = router;
