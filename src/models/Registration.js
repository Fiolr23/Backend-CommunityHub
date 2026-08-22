const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Un usuario no puede inscribirse dos veces en la misma actividad
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
