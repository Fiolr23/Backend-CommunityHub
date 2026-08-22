const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Whitelist para evitar path traversal (ej. ?folder=../../etc); otro valor cae en "misc"
const ALLOWED_FOLDERS = ['profiles', 'events'];

// La extension sale del mimetype real, nunca del nombre original
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const resolveFolder = (req) => (ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : 'misc');

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOADS_DIR, resolveFolder(req));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] || '';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    const error = new Error('Tipo de imagen no válido, use JPG, PNG o WEBP');
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
