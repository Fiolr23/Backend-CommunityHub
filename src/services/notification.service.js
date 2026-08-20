const Notification = require('../models/Notification');

// Un admin ve todas las notificaciones; un organizador solo ve las de sus propias actividades
const listNotifications = async (userId, role) => {
  const filters = role === 'admin' ? {} : { organizer: userId };
  return Notification.find(filters).populate('event', 'title date hour location').sort({ createdAt: -1 });
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
