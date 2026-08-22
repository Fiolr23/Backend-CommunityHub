// Verifica el rol del usuario (se usa despues de "protect")
// Ultimo argumento opcional: { message } para un 403 mas especifico
const authorize = (...args) => {
  let message = 'No tiene permisos para realizar esta accion';
  let allowedRoles = args;

  const lastArg = args[args.length - 1];
  if (lastArg && typeof lastArg === 'object') {
    message = lastArg.message || message;
    allowedRoles = args.slice(0, -1);
  }

  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message });
    }

    next();
  };
};

module.exports = { authorize };
