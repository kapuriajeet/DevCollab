import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir = "temp";

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'temp');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,   // 50MB
  },
});
