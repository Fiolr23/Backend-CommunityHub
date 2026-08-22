const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registra un nuevo usuario y devuelve el usuario junto con su token
const register = async ({ firstName, lastName, email, password, profileImage }) => {
  if (!firstName || !lastName || !email || !password) {
    const error = new Error('Nombre, apellido, email y contraseña son obligatorios');
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(email)) {
    const error = new Error('El formato del email no es válido');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('La contraseña debe tener al menos 8 caracteres');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  // El rol nunca se recibe del cliente: siempre se crea como "user"
  const user = await User.create({ firstName, lastName, email, password, profileImage });
  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

// Valida credenciales y devuelve el usuario junto con su token
const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('El correo y la contraseña son obligatorios');
    error.statusCode = 400;
    throw error;
  }

  // Mismo mensaje en ambos casos: no revelar si el correo existe o no
  const credentialsError = () => {
    const error = new Error('Correo o contraseña incorrectos');
    error.statusCode = 401;
    return error;
  };

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw credentialsError();

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw credentialsError();

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
