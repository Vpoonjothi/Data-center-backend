import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminEnquiryRoutes from './routes/adminEnquiryRoutes.js';
import adminQuoteRoutes from './routes/adminQuoteRoutes.js';
import adminVerificationRoutes from './routes/adminVerificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import adminKycRoutes from './routes/adminKycRoutes.js';
import adminServiceRoutes from './routes/adminServiceRoutes.js';
import adminPaymentRoutes from './routes/adminPaymentRoutes.js';
import adminComplianceRoutes from './routes/adminComplianceRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import aiServerRoutes from './routes/aiServerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminManagementRoutes from './routes/adminManagementRoutes.js';
import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import adminSettingsRoutes from './routes/adminSettingsRoutes.js';

const app = express();

/* ---------------- CORS Configuration ---------------- */

const allowedOrigins = [
  'https://greenleafagencies.com',
  'https://www.greenleafagencies.com',
  'https://api.greenleafagencies.com',
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ]
  })
);

/* ---------------- Middlewares ---------------- */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ---------------- Static Files ---------------- */

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ---------------- API Routes ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin/kyc', adminKycRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ai-servers', aiServerRoutes);
app.use('/api/notifications', notificationRoutes);

/* ---------------- Admin Routes ---------------- */

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/quotes', adminQuoteRoutes);
app.use('/api/admin/verifications', adminVerificationRoutes);
app.use('/api/admin/services', adminServiceRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/compliance', adminComplianceRoutes);
app.use('/api/admin/admins', adminManagementRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

/* ---------------- Health Check ---------------- */

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NexaCore Backend is running'
  });
});

/* ---------------- Global Error Handler ---------------- */

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

export default app;
