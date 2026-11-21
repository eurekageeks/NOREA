import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'norea-uploads')
  : path.resolve(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Random server-side filename: never trust the client-supplied name.
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ALLOWED[file.mimetype]}`),
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      return cb(ApiError.badRequest('Only JPG, PNG or WEBP images are allowed.'));
    }
    cb(null, true);
  },
});

/** Verify magic bytes after upload so a renamed non-image is rejected. */
export const verifyImageSignature = (req, _res, next) => {
  if (!req.file) return next(ApiError.badRequest('Please choose an image to upload.'));
  try {
    const fd = fs.openSync(req.file.path, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const isPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) {
      fs.unlinkSync(req.file.path);
      return next(ApiError.badRequest('The uploaded file is not a valid image.'));
    }
    next();
  } catch (err) {
    next(err);
  }
};

/** Remove a previously uploaded file (only inside /uploads). */
export const removeUpload = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const target = path.resolve(UPLOAD_DIR, path.basename(publicPath));
  if (target.startsWith(UPLOAD_DIR)) fs.promises.unlink(target).catch(() => {});
};
