import request from 'supertest';
import { Pool } from 'pg';
import app from '../../index';
import { getPool, connectDatabase } from '../../config/database';
import { createTestUser, createAuthHeader } from '../utils/testHelpers';

describe('Verification Integration Tests', () => {
  let pool: Pool;

  beforeAll(async () => {
    await connectDatabase();
    pool = getPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await pool.query('DELETE FROM verification_events WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM identity_verifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('GET /api/verification/status', () => {
    it('should get verification status for authenticated user', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .get('/api/verification/status')
        .set(createAuthHeader(testUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationStatus).toBeDefined();
      expect(response.body.data.details).toBeDefined();
      expect(response.body.data.badges).toBeDefined();
      expect(response.body.data.nextSteps).toBeDefined();
      expect(Array.isArray(response.body.data.badges)).toBe(true);
      expect(Array.isArray(response.body.data.nextSteps)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/verification/status')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no autenticado');
    });
  });

  describe('POST /api/verification/phone', () => {
    it('should update phone verification status', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post('/api/verification/phone')
        .set(createAuthHeader(testUser.accessToken))
        .send({ verified: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verificado exitosamente');
      expect(response.body.data.phoneVerified).toBe(true);

      // Verify the status was updated
      const statusResponse = await request(app)
        .get('/api/verification/status')
        .set(createAuthHeader(testUser.accessToken))
        .expect(200);

      expect(statusResponse.body.data.verificationStatus.phoneVerified).toBe(true);
    });

    it('should validate verification status value', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post('/api/verification/phone')
        .set(createAuthHeader(testUser.accessToken))
        .send({ verified: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });
  });

  describe('POST /api/verification/identity', () => {
    it('should submit identity verification with cedula', async () => {
      const testUser = await createTestUser();

      const identityData = {
        documentType: 'cedula',
        documentNumber: '1714616123', // Valid Ecuador cedula
        documentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        fullName: 'Juan Carlos Pérez González',
        dateOfBirth: '1990-05-15'
      };

      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(identityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enviada exitosamente');
      expect(response.body.data.verificationId).toBeDefined();
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.estimatedProcessingTime).toBeDefined();
    });

    it('should submit identity verification with passport', async () => {
      const testUser = await createTestUser();

      const identityData = {
        documentType: 'passport',
        documentNumber: 'AB123456',
        documentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        fullName: 'María Elena Rodríguez',
        dateOfBirth: '1985-12-20'
      };

      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(identityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    it('should validate required fields', async () => {
      const testUser = await createTestUser();

      const incompleteData = {
        documentType: 'cedula',
        documentNumber: '1714616123'
        // Missing documentPhoto, fullName, dateOfBirth
      };

      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
      expect(response.body.details).toBeDefined();
    });

    it('should validate document type', async () => {
      const testUser = await createTestUser();

      const invalidData = {
        documentType: 'invalid_type',
        documentNumber: '1714616123',
        documentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        fullName: 'Juan Pérez',
        dateOfBirth: '1990-05-15'
      };

      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });

    it('should validate Ecuador cedula format', async () => {
      const testUser = await createTestUser();

      const invalidCedulaData = {
        documentType: 'cedula',
        documentNumber: '1234567890', // Invalid cedula
        documentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        fullName: 'Juan Pérez',
        dateOfBirth: '1990-05-15'
      };

      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(invalidCedulaData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });

    it('should prevent duplicate pending verifications', async () => {
      const testUser = await createTestUser();

      const identityData = {
        documentType: 'cedula',
        documentNumber: '1714616123',
        documentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        fullName: 'Juan Pérez',
        dateOfBirth: '1990-05-15'
      };

      // First submission
      await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(identityData)
        .expect(201);

      // Second submission should be rejected
      const response = await request(app)
        .post('/api/verification/identity')
        .set(createAuthHeader(testUser.accessToken))
        .send(identityData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('pendiente');
    });
  });

  describe('GET /api/verification/requirements/:action', () => {
    it('should get requirements for booking rides', async () => {
      const response = await request(app)
        .get('/api/verification/requirements/book_ride')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe('book_ride');
      expect(response.body.data.requirements).toBeDefined();
      expect(response.body.data.requirements.required).toContain('phone');
      expect(response.body.data.requirements.required).toContain('identity');
      expect(response.body.data.requirements.required).toContain('background');
    });

    it('should get requirements for creating trips', async () => {
      const response = await request(app)
        .get('/api/verification/requirements/create_trip')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.requirements.required).toContain('driver');
      expect(response.body.data.requirements.required).toContain('vehicle');
    });

    it('should include user status when authenticated', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .get('/api/verification/requirements/book_ride')
        .set(createAuthHeader(testUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userStatus).toBeDefined();
      expect(response.body.data.userStatus.current).toBeDefined();
      expect(response.body.data.userStatus.missing).toBeDefined();
      expect(response.body.data.userStatus.canPerformAction).toBeDefined();
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .get('/api/verification/requirements/invalid_action')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no válida');
    });
  });

  describe('GET /api/verification/history', () => {
    it('should get verification history for authenticated user', async () => {
      const testUser = await createTestUser();

      // Create some verification events first
      await request(app)
        .post('/api/verification/phone')
        .set(createAuthHeader(testUser.accessToken))
        .send({ verified: true });

      const response = await request(app)
        .get('/api/verification/history')
        .set(createAuthHeader(testUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(Array.isArray(response.body.data.history)).toBe(true);
      expect(response.body.data.history.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .get('/api/verification/history?page=1&limit=5')
        .set(createAuthHeader(testUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/verification/history')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no autenticado');
    });
  });
});