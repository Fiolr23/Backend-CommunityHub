const Event = require('../models/Event');
const Category = require('../models/Category');
const Registration = require('../models/Registration');

const ALLOWED_FIELDS = ['title', 'description', 'category', 'date', 'hour', 'location', 'capacity', 'image', 'status'];

// Copia solo los campos permitidos del body, ignorando cualquier otro dato (ej. organizer)
const pickAllowedFields = (data) => {
  const result = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (data[field] !== undefined) result[field] = data[field];
  });
  return result;
};

// Costa Rica es siempre UTC-6. Sin este ancla, un server en otro huso (como AWS Lambda, que usa UTC)
// interpretaria mal la hora. Mismo criterio que usa la Lambda.
const LOCAL_UTC_OFFSET = '-06:00';

const combineDateAndHour = (date, hour) => {
  const isoDate = new Date(date).toISOString().slice(0, 10);
  return hour ? new Date(`${isoDate}T${hour}:00${LOCAL_UTC_OFFSET}`) : new Date(date);
};

const validateDateNotInPast = (date, hour) => {
  if (combineDateAndHour(date, hour) < new Date()) {
    const error = new Error('La fecha del evento no puede ser en el pasado');
    error.statusCode = 400;
    throw error;
  }
};

const validateCategoryExists = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    const error = new Error('La categoría seleccionada no existe');
    error.statusCode = 404;
    throw error;
  }
};

// Pasa a "completed" las activas que ya pasaron de hora. Se corre antes de cada consulta, sin cron.
const syncCompletedEvents = async () => {
  const now = new Date();
  const activeEvents = await Event.find({ status: 'active' }).select('date hour');

  const expiredIds = activeEvents
    .filter((event) => combineDateAndHour(event.date, event.hour) < now)
    .map((event) => event._id);

  if (expiredIds.length > 0) {
    await Event.updateMany({ _id: { $in: expiredIds } }, { status: 'completed' });
  }
};

// Lista eventos, con filtros opcionales por categoria, estado u organizador
const listEvents = async ({ category, status, organizer } = {}) => {
  await syncCompletedEvents();

  const filters = {};
  if (category) filters.category = category;
  if (status) filters.status = status;
  if (organizer) filters.organizer = organizer;

  return Event.find(filters)
    .populate('organizer', 'firstName lastName email')
    .populate('category', 'name')
    .sort({ date: 1 });
};

const getEventById = async (id) => {
  await syncCompletedEvents();

  const event = await Event.findById(id)
    .populate('organizer', 'firstName lastName email')
    .populate('category', 'name');
  if (!event) {
    const error = new Error('El evento no existe');
    error.statusCode = 404;
    throw error;
  }
  return event;
};

// El organizador siempre se toma del usuario autenticado, nunca del body
const createEvent = async (data, organizerId) => {
  const eventData = pickAllowedFields(data);

  if (!eventData.title) {
    const error = new Error('El titulo es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  if (eventData.date) validateDateNotInPast(eventData.date, eventData.hour);
  if (eventData.category) await validateCategoryExists(eventData.category);

  const event = await Event.create({ ...eventData, organizer: organizerId });
  return event.populate([
    { path: 'organizer', select: 'firstName lastName email' },
    { path: 'category', select: 'name' },
  ]);
};

// Solo el organizador dueno del evento o un admin pueden modificarlo
const updateEvent = async (id, data, userId, userRole) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error('El evento no existe');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'admin' && event.organizer.toString() !== userId) {
    const error = new Error('No puede modificar actividades de otro organizador');
    error.statusCode = 403;
    throw error;
  }

  // Una actividad finalizada queda de solo lectura para edicion, incluso para el admin
  if (event.status === 'completed') {
    const error = new Error('La actividad finalizada no puede ser editada');
    error.statusCode = 409;
    throw error;
  }

  const updates = pickAllowedFields(data);

  // Solo valida "no en el pasado" si la fecha/hora realmente cambia; si no, editar otro campo
  // de una actividad ya vencida quedaria bloqueado sin necesidad.
  if (updates.date || updates.hour) {
    const newDate = updates.date ?? event.date;
    const newHour = updates.hour ?? event.hour;
    const changed = combineDateAndHour(newDate, newHour).getTime() !== combineDateAndHour(event.date, event.hour).getTime();
    if (changed) validateDateNotInPast(newDate, newHour);
  }

  if (updates.category) await validateCategoryExists(updates.category);

  Object.assign(event, updates);
  await event.save();
  return event.populate([
    { path: 'organizer', select: 'firstName lastName email' },
    { path: 'category', select: 'name' },
  ]);
};

const deleteEvent = async (id, userId, userRole) => {
  const event = await Event.findById(id);
  if (!event) {
    const error = new Error('El evento no existe');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'admin' && event.organizer.toString() !== userId) {
    const error = new Error('No puede eliminar actividades de otro organizador');
    error.statusCode = 403;
    throw error;
  }

  const hasRegistrations = await Registration.exists({ event: id });
  if (hasRegistrations) {
    const error = new Error('No se puede eliminar una actividad con inscripciones; cancélela en su lugar');
    error.statusCode = 409;
    throw error;
  }

  await event.deleteOne();
};

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
