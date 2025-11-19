import request from 'supertest';
import { Pool } from 'pg';
import app from '../../index';
import { getPool, connectDatabase } from '../../config/database';
import { createTestUser, createAuthHeader } from '../utils/testHelpers';

describe('Admin Verification Integration Tests', () => {
  let pool: Pool;

  beforeAll(async () => {
    await connectDatabase();
    pool = getPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM identity_verifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('GET /api/admin/verification/queue', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/verification/queue')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      const testUser = await createTestUser({ role: 'user' });

      const response = await request(app)
        .get('/api/admin/verification/queue')
        .set(createAuthHeader(testUser.accessToken))
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Moderator access required');
    });

    it('should return verification queue for admin', async () => {
      const adminUser = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .get('/api/admin/verification/queue')
        .set(createAuthHeader(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('requests');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data).toHaveProperty('stats');
    });
  });

  describe('GET /api/admin/verification/stats', () => {
    it('should return verification statistics', async () => {
      const adminUser = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .get('/api/admin/verification/stats')
        .set(createAuthHeader(adminUser.accessToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_requests');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('approved');
      expect(response.body.data).toHaveProperty('rejected');
    });
  });
});