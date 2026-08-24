const { Router } = require('express');
const registrationController = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const router = Router();

// Vista global de inscripciones: el organizador ve las de sus propias actividades, el admin ve todas
// (el filtro exacto se resuelve en registration.service.js segun req.userRole)
router.get('/', protect, authorize('organizer', 'admin'), registrationController.listRegistrations);

module.exports = router;
