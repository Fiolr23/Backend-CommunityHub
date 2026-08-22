const notificationService = require('../services/notification.service');

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.listNotifications(req.userId);
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.userId);
    res.status(200).json({ notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.userId);
    res.status(200).json({ message: 'Notificaciones marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
