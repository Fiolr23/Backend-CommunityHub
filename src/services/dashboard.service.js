const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const eventService = require('./event.service');

// Proximas actividades activas en las que el usuario esta inscrito, ordenadas por fecha
const getUserDashboard = async (userId) => {
  const [registrationsCount, favoritesCount, registrations] = await Promise.all([
    Registration.countDocuments({ user: userId }),
    Favorite.countDocuments({ user: userId }),
    Registration.find({ user: userId }).populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    }),
  ]);

  const upcomingRegistrations = registrations
    .filter((r) => r.event && r.event.status === 'active')
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
    .slice(0, 5);

  return { role: 'user', registrationsCount, favoritesCount, upcomingRegistrations };
};

// Actividades propias del organizador, ya con registeredCount/capacity por actividad
// (eventService.listEvents ya trae eso; no hace falta una agregacion nueva)
const getOrganizerDashboard = async (userId) => {
  const events = await eventService.listEvents({ organizer: userId });

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === 'active').length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

  return { role: 'organizer', totalEvents, activeEvents, totalRegistrations, events };
};

const getAdminDashboard = async () => {
  await eventService.syncCompletedEvents();

  const [
    totalUsers,
    totalOrganizers,
    totalAdmins,
    activeEvents,
    completedEvents,
    cancelledEvents,
    totalRegistrations,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'organizer' }),
    User.countDocuments({ role: 'admin' }),
    Event.countDocuments({ status: 'active' }),
    Event.countDocuments({ status: 'completed' }),
    Event.countDocuments({ status: 'cancelled' }),
    Registration.countDocuments(),
  ]);

  return {
    role: 'admin',
    totalUsers,
    totalOrganizers,
    totalAdmins,
    totalEvents: activeEvents + completedEvents + cancelledEvents,
    eventsByStatus: { active: activeEvents, completed: completedEvents, cancelled: cancelledEvents },
    totalRegistrations,
  };
};

// El rol sale del JWT verificado (req.userRole), nunca de un parametro del cliente
const getDashboard = async (userId, userRole) => {
  if (userRole === 'admin') return getAdminDashboard();
  if (userRole === 'organizer') return getOrganizerDashboard(userId);
  return getUserDashboard(userId);
};

module.exports = { getDashboard };
