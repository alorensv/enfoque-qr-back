import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export function maintenanceMulterStorage(type: 'fotos' | 'documentos') {
  return diskStorage({
    destination: (req, file, cb) => {
      // id de mantención en la URL: /maintenances/:id/photos o /maintenances/:id/documents
      const maintenanceId = req.params.id;
      const dest = path.join(process.cwd(), 'backend', 'public', 'mantenciones', String(maintenanceId), type);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, unique);
    },
  });
}
