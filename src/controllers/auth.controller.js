const authService = require('../services/auth.service');

// Saca la contraseña antes de responder
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, profileImage } = req.body;
    const { user, token } = await authService.register({ firstName, lastName, email, password, profileImage });
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res.status(200).json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId);
    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Con JWT el logout lo hace el cliente descartando el token; existe por consistencia con la API
const logout = async (_req, res) => {
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { register, login, me, logout };
