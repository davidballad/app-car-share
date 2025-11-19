import request from 'supertest';
import { Pool } from 'pg';
import app from '../../index';
import { getPool, connectDatabase } from '../../config/database';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';

describe('Auth Integration Tests', () => {
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
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      phone: '+593987654321',
      password: 'TestPassword123!',
      firstName: 'Juan',
      lastName: 'Pérez',
      dateOfBirth: '1990-01-01'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registrado exitosamente');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.phone).toBe(validUserData.phone);
      expect(response.body.data.user.firstName).toBe(validUserData.firstName);
      expect(response.body.data.user.lastName).toBe(validUserData.lastName);
      
      // Should not return password hash
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing phone, password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    it('should reject registration with invalid email format', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email inválido');
    });

    it('should reject registration with invalid Ecuador phone number', async () => {
      const invalidPhoneData = {
        ...validUserData,
        phone: '+1234567890' // US phone number
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPhoneData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ecuatoriano inválido');
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordData = {
        ...validUserData,
        password: '123456' // Weak password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requisitos de seguridad');
      expect(response.body.details).toBeDefined();
    });

    it('should reject registration with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const duplicateEmailData = {
        ...validUserData,
        phone: '+593987654322' // Different phone
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateEmailData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Ya existe una cuenta con este email');
    });

    it('should reject registration with duplicate phone', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same phone
      const duplicatePhoneData = {
        ...validUserData,
        email: 'different@example.com' // Different email
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicatePhoneData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Ya existe una cuenta con este número de teléfono');
    });

    it('should format Ecuador phone numbers correctly', async () => {
      const phoneVariations = [
        { input: '0987654321', expected: '+593987654321' },
        { input: '593987654321', expected: '+593987654321' },
        { input: '+593987654321', expected: '+593987654321' },
        { input: '987654321', expected: '+593987654321' }
      ];

      for (const phoneTest of phoneVariations) {
        const userData = {
          ...validUserData,
          email: `test${Math.random()}@example.com`, // Unique email
          phone: phoneTest.input
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.data.user.phone).toBe(phoneTest.expected);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      email: 'login-test@example.com',
      phone: '+593987654321',
      password: 'TestPassword123!',
      firstName: 'Juan',
      lastName: 'Pérez'
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('exitoso');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
    });
  });

  describe('POST /api/auth/send-verification', () => {
    it('should send verification code for valid Ecuador phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({
          phone: '+593987654321'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('enviado exitosamente');
      expect(response.body.data.phone).toBe('+593987654321');
      expect(response.body.data.verificationId).toBeDefined();
    });

    it('should reject invalid phone number format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({
          phone: '+1234567890' // US phone number
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('ecuatoriano inválido');
    });

    it('should reject missing phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requerido');
    });
  });

  describe('POST /api/auth/verify-phone', () => {
    it('should verify phone with correct mock code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .send({
          phone: '+593987654321',
          code: '123456' // Mock verification code
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verificado exitosamente');
      expect(response.body.data.phoneVerified).toBe(true);
    });

    it('should reject incorrect verification code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .send({
          phone: '+593987654321',
          code: '000000' // Wrong code
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });

    it('should reject missing phone or code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .send({
          phone: '+593987654321'
          // Missing code
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const userData = {
        email: 'refresh-test@example.com',
        phone: '+593987654321',
        password: 'TestPassword123!',
        firstName: 'Juan',
        lastName: 'Pérez'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('renovados exitosamente');
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requerido');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;
    let userData: any;

    beforeEach(async () => {
      userData = {
        email: 'me-test@example.com',
        phone: '+593987654321',
        password: 'TestPassword123!',
        firstName: 'Juan',
        lastName: 'Pérez'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      
      // Should not return sensitive data
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requerido');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'logout-test@example.com',
        phone: '+593987654321',
        password: 'TestPassword123!',
        firstName: 'Juan',
        lastName: 'Pérez'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cerrada exitosamente');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requerido');
    });
  });
});