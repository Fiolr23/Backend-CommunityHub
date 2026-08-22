const { Router } = require('express');
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');

const router = Router();

// Sin "protect": la foto de perfil se sube antes de tener token. Igual se valida tipo y tamano.
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
