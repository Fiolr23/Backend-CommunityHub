const registrationService = require('../services/registration.service');

const register = async (req, res, next) => {
  try {
    const registration = await registrationService.registerForEvent(req.params.id, req.userId);
    res.status(201).json({ registration, message: 'Inscripción realizada correctamente' });
  } catch (error) {
    next(error);
  }
};

const unregister = async (req, res, next) => {
  try {
    await registrationService.cancelRegistration(req.params.id, req.userId);
    res.status(200).json({ message: 'Inscripción cancelada correctamente' });
  } catch (error) {
    next(error);
  }
};

const listMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.listMyRegistrations(req.userId);
    res.status(200).json({ registrations });
  } catch (error) {
    next(error);
  }
};

const listRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.listRegistrationsForViewer(req.userId, req.userRole);
    res.status(200).json({ registrations });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, unregister, listMyRegistrations, listRegistrations };
