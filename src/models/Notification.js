const mongoose = require('mongoose');

// Las crea la Lambda de recordatorios; el backend solo las lee
const notificationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['reminder'],
      default: 'reminder',
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Evita que se generen recordatorios duplicados para el mismo evento
notificationSchema.index({ event: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);
