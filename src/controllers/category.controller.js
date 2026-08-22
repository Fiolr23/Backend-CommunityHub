const categoryService = require('../services/category.service');

const listCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.listCategories({ includeInactive });
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
