import multer from 'multer';
import { appConfig } from '../config/index';
import { mkdirSync, existsSync } from 'node:fs';
import { fixFilenameEncoding } from '../utils/encoding.js';

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
  fileFilter: (_req, file, cb) => {
    // 修复中文文件名乱码问题
    const fixedFilename = fixFilenameEncoding(file.originalname);
    
    if (fixedFilename !== file.originalname) {
      console.log(`[Upload Middleware] Filename encoding fixed: ${file.originalname} -> ${fixedFilename}`);
    }
    
    file.originalname = fixedFilename;
    cb(null, true);
  },
});

export const singleUpload = upload.single('file');
