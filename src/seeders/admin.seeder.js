// Crea el admin inicial. Correr con: npm run seed:admin (no se ejecuta solo)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const run = async () => {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error('Definí ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD en tu .env antes de correr el seeder');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_SEED_PASSWORD debe tener al menos 8 caracteres');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Ya existe un usuario con el email ${email}, no se crea otro administrador`);
  } else {
    // La contraseña se hashea sola via el hook pre-save del modelo User
    await User.create({
      firstName: 'Fiorella',
      lastName: 'Lazo',
      email,
      password,
      role: 'admin',
    });
    console.log(`Administrador inicial creado correctamente: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error('Error ejecutando el seeder:', error.message);
  process.exit(1);
});
