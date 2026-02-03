import multer from 'multer';
import { appConfig } from '../config/index';
import { mkdirSync, existsSync } from 'node:fs';

const tempDir = appConfig.upload.tempDir;

if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: appConfig.upload.maxSize,
  },
});

export const singleUpload = upload.single('file');
