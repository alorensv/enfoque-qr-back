import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export function maintenanceMulterStorage(type: 'fotos' | 'documentos') {
  return diskStorage({
    destination: (req, file, cb) => {
      // Guardar siempre en una carpeta temporal primero
      const tmpDir = path.join(process.cwd(), 'public', 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, unique);
    },
  });
}
