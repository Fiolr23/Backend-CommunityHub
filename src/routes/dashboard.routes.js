const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// La forma de la respuesta depende del rol del usuario autenticado (ver dashboard.service.js);
// el rol siempre sale del JWT verificado, nunca de un parametro de la peticion.
router.get('/', protect, dashboardController.getDashboard);

module.exports = router;
