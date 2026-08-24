const Favorite = require('../models/Favorite');
const eventService = require('./event.service');

// Marca la actividad como favorita para el usuario autenticado
const addFavorite = async (eventId, userId) => {
  await eventService.getEventById(eventId);

  try {
    return await Favorite.create({ user: userId, event: eventId });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Ya marcaste esta actividad como favorita');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
};

// Quita la actividad de favoritos del usuario autenticado
const removeFavorite = async (eventId, userId) => {
  const favorite = await Favorite.findOneAndDelete({ event: eventId, user: userId });
  if (!favorite) {
    const error = new Error('Esta actividad no está en tus favoritos');
    error.statusCode = 404;
    throw error;
  }
  return favorite;
};

// Favoritos del usuario autenticado, con los datos de la actividad correspondiente
const listMyFavorites = async (userId) => {
  return Favorite.find({ user: userId })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    })
    .sort({ createdAt: -1 });
};

module.exports = { addFavorite, removeFavorite, listMyFavorites };
