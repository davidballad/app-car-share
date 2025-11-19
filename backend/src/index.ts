import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from './config/database';
import { connectRedis, closeRedis } from './config/redis';
import { SchedulerService } from './services/SchedulerService';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import reviewRoutes from './routes/reviews';
import verificationRoutes from './routes/verification';
import documentRoutes from './routes/documents';
import adminRoutes from './routes/admin';
import tripRoutes from './routes/trips';
import bookingRoutes from './routes/bookings';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rideshare.ec', 'https://admin.rideshare.ec']
    : ['http://localhost:3000', 'http://localhost:3001']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);

// Default API route
app.use('/api', (req, res) => {
  res.json({ 
    message: 'Ecuador Rideshare API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      reviews: '/api/reviews',
      verification: '/api/verification',
      documents: '/api/documents',
      trips: '/api/trips',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Ecuador Rideshare API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Start scheduler for trip reminders
      try {
        const { getPool } = require('./config/database');
        const schedulerService = new SchedulerService(getPool());
        schedulerService.startScheduler();
      } catch (error) {
        console.warn('⚠️ Could not start scheduler service:', error);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;