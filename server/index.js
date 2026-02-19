// ===== ENV SETUP (MUST BE FIRST) =====
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env'
});

// ===== IMPORTS =====
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes');
const { uploadsDir } = require('./middlewares/upload');

// ===== ENSURE UPLOADS DIRECTORY EXISTS =====
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

// ===== TRUST PROXY (NGINX / VPS) =====
app.set('trust proxy', 1);

// ===== SECURITY HEADERS =====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ===== RATE LIMITING =====
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 60 * 1000),
  max: Number(process.env.RATE_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ===== CORS CONFIGURATION (FIXED) =====
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map(o => o.trim())
  : [
      'https://parnanzonehomes.com',
      'https://www.parnanzonehomes.com',
      'https://admin.parnanzonehomes.com'
    ];

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, curl (no origin header)
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost only in dev or explicitly enabled
    const allowLocal =
      process.env.NODE_ENV !== 'production' ||
      process.env.ALLOW_LOCAL_DEV === 'true';

    if (
      allowLocal &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    ) {
      console.log('✅ CORS: Allowed localhost origin:', origin);
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowed origin:', origin);
      return callback(null, true);
    }

    // CRITICAL FIX: Don't pass Error object, just return false
    console.warn(
      `⚠️  CORS: Rejected origin: ${origin} | Allowed: ${allowedOrigins.join(', ')}`
    );
    return callback(null, false); // Changed from callback(new Error(...), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// ===== BODY SIZE LIMITS =====
const jsonLimit = process.env.JSON_LIMIT || '1mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// ===== REQUEST LOGGER =====
app.use((req, res, next) => {
  try {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'none'} | Host: ${req.headers.host || '-'}`
    );
  } catch (e) {}
  next();
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ===== DEBUG UPLOADS (DISABLED BY DEFAULT) =====
app.get('/debug/uploads', (req, res) => {
  if (process.env.DEBUG_UPLOADS !== 'true') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const files = fs.readdirSync(uploadsDir).filter(f => f[0] !== '.');
    res.json({ ok: true, count: files.length, files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read uploads' });
  }
});

// ===== STATIC UPLOADS =====
app.use('/uploads', express.static(uploadsDir));

// ===== DATABASE CONNECTION =====
if (!process.env.MONGO_URI) {
  throw new Error('❌ MONGO_URI is not defined');
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // ===== AUTO-SEED DEFAULT ADMIN =====
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');
    const defaultAdmin = {
      name: 'kawish iqbal',
      email: 'kawishiqbal898@gmail.com',
      password: '11223344'
    };
    const exists = await Admin.findOne({ email: defaultAdmin.email.toLowerCase() });
    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultAdmin.password, salt);
      await Admin.create({
        name: defaultAdmin.name,
        email: defaultAdmin.email.toLowerCase(),
        passwordHash
      });
      console.log(`✅ Default admin seeded: ${defaultAdmin.email}`);
    }
  } catch (seedErr) {
    console.error('⚠️  Admin seed error (non-fatal):', seedErr.message);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error', err);
  process.exit(1);
});

// ===== API ROUTES =====
app.use('/api', apiRoutes);

// ===== API 404 FALLBACK =====
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});

// ===== GRACEFUL SHUTDOWN =====
const shutdown = () => {
  console.log('🛑 Shutting down...');
  server.close(() => {
    mongoose.disconnect().then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});