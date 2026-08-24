const favoriteService = require('../services/favorite.service');

const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.addFavorite(req.params.id, req.userId);
    res.status(201).json({ favorite, message: 'Actividad agregada a favoritos' });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await favoriteService.removeFavorite(req.params.id, req.userId);
    res.status(200).json({ message: 'Actividad quitada de favoritos' });
  } catch (error) {
    next(error);
  }
};

const listMyFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.listMyFavorites(req.userId);
    res.status(200).json({ favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, removeFavorite, listMyFavorites };
