const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hour: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: null,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    // Contador atomico de inscripciones. Se mantiene junto con la coleccion Registration
    // (fuente de verdad de quien esta inscrito) para poder validar el cupo con una unica
    // operacion atomica por documento y evitar que se supere la capacidad ante inscripciones
    // simultaneas. Ver registration.service.js.
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Event', eventSchema);
