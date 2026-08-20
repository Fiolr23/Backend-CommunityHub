const Category = require('../models/Category');
const Event = require('../models/Event');

// Por defecto solo trae activas; /admin/categories pide includeInactive=true para ver todas
const listCategories = async ({ includeInactive } = {}) => {
  const filters = includeInactive ? {} : { isActive: true };
  return Category.find(filters).sort({ name: 1 });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('La categoría no existe');
    error.statusCode = 404;
    throw error;
  }
  return category;
};

// Busca ignorando mayus/minus (collation)
const assertNameNotTaken = async (name, excludeId) => {
  const filters = { name: name.trim() };
  if (excludeId) filters._id = { $ne: excludeId };

  const existing = await Category.findOne(filters).collation({ locale: 'es', strength: 2 });
  if (existing) {
    const error = new Error('Ya existe una categoría con ese nombre');
    error.statusCode = 409;
    throw error;
  }
};

const createCategory = async ({ name, description }) => {
  if (!name || !name.trim()) {
    const error = new Error('El nombre de la categoría es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  await assertNameNotTaken(name);

  return Category.create({ name: name.trim(), description });
};

const updateCategory = async (id, { name, description, isActive }) => {
  const category = await getCategoryById(id);

  if (name !== undefined) {
    if (!name.trim()) {
      const error = new Error('El nombre de la categoría es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    await assertNameNotTaken(name, id);
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  const inUse = await Event.exists({ category: id });
  if (inUse) {
    const error = new Error('No se puede eliminar una categoría en uso; desactívela en su lugar');
    error.statusCode = 409;
    throw error;
  }

  await category.deleteOne();
};

module.exports = { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
