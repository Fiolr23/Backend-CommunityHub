const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indice unico sin distinguir mayus/minus: "Tecnologia" y "tecnologia" son la misma
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });

module.exports = mongoose.model('Category', categorySchema);
