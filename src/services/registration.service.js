const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const eventService = require('./event.service');

const assertEventAvailable = (event) => {
  // syncCompletedEvents (dentro de eventService.getEventById) ya paso a "completed"
  // las activas cuya fecha/hora vencio, asi que este chequeo cubre cancelada, finalizada y vencida
  if (event.status !== 'active') {
    const error = new Error('La actividad no está disponible para inscripciones');
    error.statusCode = 409;
    throw error;
  }
};

// El organizador de la actividad no participa como inscrito en su propio evento.
// event.organizer viene poblado (eventService.getEventById), pero se soporta tambien
// el caso sin poblar para no depender de un detalle interno de esa funcion.
const assertNotOrganizer = (event, userId) => {
  const organizerId = (event.organizer?._id ?? event.organizer).toString();
  if (organizerId === userId.toString()) {
    const error = new Error('No puedes inscribirte en una actividad que tú organizas');
    error.statusCode = 403;
    throw error;
  }
};

// Inscribe al usuario autenticado en la actividad.
//
// La coleccion Registration es la fuente de verdad de quien esta inscrito, pero contar sus
// documentos y despues insertar uno nuevo NO es atomico entre dos inscripciones simultaneas de
// usuarios distintos (cada una escribe un documento propio, asi que Mongo no las serializa).
// Por eso el cupo se controla con un incremento atomico y condicional sobre "registeredCount"
// en el propio documento Event: si dos inscripciones llegan al mismo tiempo, Mongo serializa esa
// escritura sobre el mismo documento y solo una logra pasar la condicion de cupo disponible.
// Todo se hace dentro de una transaccion para que el contador y la inscripcion queden consistentes.
const registerForEvent = async (eventId, userId) => {
  const event = await eventService.getEventById(eventId);
  assertNotOrganizer(event, userId);
  assertEventAvailable(event);

  const session = await mongoose.startSession();
  try {
    let registration;
    await session.withTransaction(async () => {
      const alreadyRegistered = await Registration.findOne({ event: eventId, user: userId }).session(session);
      if (alreadyRegistered) {
        const error = new Error('Ya estás inscrito en esta actividad');
        error.statusCode = 409;
        throw error;
      }

      const updatedEvent = await Event.findOneAndUpdate(
        { _id: eventId, status: 'active', $expr: { $lt: ['$registeredCount', '$capacity'] } },
        { $inc: { registeredCount: 1 } },
        { returnDocument: 'after', session }
      );
      if (!updatedEvent) {
        const error = new Error('No hay espacios disponibles para esta actividad');
        error.statusCode = 409;
        throw error;
      }

      const created = await Registration.create([{ user: userId, event: eventId }], { session });
      registration = created[0];
    });
    return registration;
  } catch (error) {
    // Indice unico (user, event): red de seguridad ante dos inscripciones simultaneas del mismo usuario
    if (error.code === 11000) {
      const duplicateError = new Error('Ya estás inscrito en esta actividad');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  } finally {
    session.endSession();
  }
};

// Cancela unicamente la inscripcion del usuario autenticado. Nunca modifica el estado del evento;
// solo decrementa el contador de cupo (atomico, dentro de la misma transaccion que el borrado).
const cancelRegistration = async (eventId, userId) => {
  await eventService.getEventById(eventId);

  const session = await mongoose.startSession();
  try {
    let registration;
    await session.withTransaction(async () => {
      registration = await Registration.findOneAndDelete({ event: eventId, user: userId }).session(session);
      if (!registration) {
        const error = new Error('No estás inscrito en esta actividad');
        error.statusCode = 404;
        throw error;
      }

      await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } }).session(session);
    });
    return registration;
  } finally {
    session.endSession();
  }
};

// Inscripciones del usuario autenticado, con los datos de la actividad correspondiente
const listMyRegistrations = async (userId) => {
  return Registration.find({ user: userId })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    })
    .sort({ createdAt: -1 });
};

module.exports = { registerForEvent, cancelRegistration, listMyRegistrations };
