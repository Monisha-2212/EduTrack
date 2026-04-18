import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dns from 'dns';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import notificationRoutes from './routes/notifications.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';

// Socket + Jobs
import { socketHandler } from './socket/socketHandler.js';
import { startDeadlineNotifier } from './jobs/deadlineNotifier.js';

// ─── App setup ────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Rate limiting on auth routes ────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => process.env.NODE_ENV === 'development',
  message: { message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Serve static in production ───────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  // Fallback: serve index.html for all non-API routes (SPA)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// ─── Error handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

// ─── Database + Server startup ────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log('[DNS] Custom DNS servers set:', dns.getServers());

const mongoUri = process.env.MONGO_URI || getMongoUriFromEnv();
if (!mongoUri) {
  console.error('[MongoDB] Connection failed: MONGO_URI not configured. Set MONGO_URI or MONGO_USER/MONGO_PASSWORD/MONGO_HOST.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('[MongoDB] Connected successfully.');
    startDeadlineNotifier();

    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  });

function getMongoUriFromEnv() {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST;
  const db = process.env.MONGO_DB || 'edutrack';

  if (!user || !password || !host) {
    return null;
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${db}?retryWrites=true&w=majority&authSource=admin&appName=Cluster0`;
}
