const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Registra un nuevo usuario y devuelve el usuario junto con su token
const register = async ({ firstName, lastName, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ firstName, lastName, email, password });
  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

// Valida credenciales y devuelve el usuario junto con su token
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

// Obtiene el usuario autenticado por su id
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = { register, login, getProfile };
