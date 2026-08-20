const eventService = require('../services/event.service');

const listEvents = async (req, res, next) => {
  try {
    const { category, status, organizer } = req.query;
    const events = await eventService.listEvents({ category, status, organizer });
    res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.userId);
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.userId, req.userRole);
    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id, req.userId, req.userRole);
    res.status(200).json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };
