const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Sube una imagen y devuelve su ruta
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen' });
  }

  const relativePath = path.relative(UPLOADS_DIR, req.file.path).split(path.sep).join('/');
  res.status(201).json({ image: `/uploads/${relativePath}` });
};

module.exports = { uploadImage };
