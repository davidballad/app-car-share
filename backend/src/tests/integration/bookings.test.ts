import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bookingRoutes from '../../routes/bookings';

// Create a test app without database connection
const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use('/api/bookings', bookingRoutes);
  
  return app;
};

describe('Booking Management API', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/bookings', () => {
    it('should reject booking creation without authentication', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          tripId: '123e4567-e89b-12d3-a456-426614174000',
          seatsBooked: 2,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put('/api/bookings/123e4567-e89b-12d3-a456-426614174000')
        .send({ status: 'completed' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should reject cancellation without authentication', async () => {
      const response = await request(app)
        .delete('/api/bookings/123e4567-e89b-12d3-a456-426614174000')
        .send({ cancellationReason: 'Test cancellation' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});