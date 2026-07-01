import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure base upload directory exists
const baseUploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If it's a KYC document or payment receipt, we want to store it in /uploads/{type}/{userId}/
    const userId = req.user ? req.user.id : 'temp';
    
    let typeDir = 'misc';
    if (
      file.fieldname.includes('aadhaar') || 
      file.fieldname.includes('pan') || 
      file.fieldname.includes('gst') || 
      file.fieldname === 'document' ||
      (req.originalUrl && req.originalUrl.includes('/kyc'))
    ) {
      typeDir = 'kyc';
    } else if (
      file.fieldname.includes('payment') || 
      file.fieldname.includes('receipt') ||
      (req.originalUrl && req.originalUrl.includes('/payment'))
    ) {
      typeDir = 'payments';
    }

    const uploadPath = path.join(baseUploadDir, typeDir, userId.toString());

    // Create user-specific folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // e.g. aadhaar_front-123456789.pdf
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter (PDF, JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'));
  }
};

// 5MB limit
const limits = {
  fileSize: 5 * 1024 * 1024 
};

export const uploadKYCDocs = multer({
  storage,
  fileFilter,
  limits
});

// Provide a generic upload export to not break existing code
export const upload = multer({
  storage,
  fileFilter,
  limits
});
