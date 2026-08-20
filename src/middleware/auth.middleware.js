const { verifyToken } = require('../utils/jwt');

// Valida el JWT del header Authorization y agrega el id de usuario a la request
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    // jwt.verify lanza TokenExpiredError o JsonWebTokenError; ambos son 401 para el cliente
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

module.exports = { protect };
