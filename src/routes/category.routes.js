const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const router = Router();

// Lectura publica: la necesitan user y organizer para ver categorias
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);

// Gestion de categorias: exclusiva del admin
router.post('/', protect, authorize('admin'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
