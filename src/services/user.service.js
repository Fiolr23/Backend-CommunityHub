const User = require('../models/User');

const VALID_ROLES = ['user', 'organizer', 'admin'];

const listUsers = async () => {
  return User.find();
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// Evita que el sistema se quede sin administradores
const assertNotLastAdmin = async (targetUser, message) => {
  if (targetUser.role !== 'admin') return;

  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount <= 1) {
    const error = new Error(message);
    error.statusCode = 409;
    throw error;
  }
};

// Un usuario puede editar su propio perfil; un admin puede editar cualquiera (incluido el rol)
const updateUser = async (id, data, requesterId, requesterRole) => {
  if (requesterRole !== 'admin' && requesterId !== id) {
    const error = new Error('No puede modificar el perfil de otro usuario');
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  ['firstName', 'lastName', 'profileImage'].forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });

  // Solo un admin puede cambiar el rol de un usuario
  if (requesterRole === 'admin' && data.role !== undefined) {
    if (!VALID_ROLES.includes(data.role)) {
      const error = new Error('Rol inválido');
      error.statusCode = 400;
      throw error;
    }

    if (data.role !== 'admin') {
      await assertNotLastAdmin(user, 'No se puede quitar el rol de administrador al único admin del sistema');
    }

    user.role = data.role;
  }

  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await assertNotLastAdmin(user, 'No se puede eliminar al único administrador del sistema');

  await user.deleteOne();
};

module.exports = { listUsers, getUserById, updateUser, deleteUser };
