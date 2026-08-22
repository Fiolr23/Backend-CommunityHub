const Notification = require('../models/Notification');

// Cada usuario ve solo sus propias notificaciones, sin importar el rol (tampoco el admin)
const listNotifications = async (userId) => {
  return Notification.find({ organizer: userId }).populate('event', 'title date hour location').sort({ createdAt: -1 });
};

// Nadie puede marcar como leida una notificacion de otro usuario, ni siquiera el admin
const markAsRead = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    const error = new Error('La notificación no existe');
    error.statusCode = 404;
    throw error;
  }

  if (notification.organizer.toString() !== userId) {
    const error = new Error('No puede modificar notificaciones de otro usuario');
    error.statusCode = 403;
    throw error;
  }

  notification.read = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ organizer: userId, read: false }, { read: true });
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
