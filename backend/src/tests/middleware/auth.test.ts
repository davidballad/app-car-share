import { Request, Response, NextFunction } from 'express';
import { authenticateToken, optionalAuth, requireVerification, requireValidBackgroundCheck } from '../../middleware/auth';
import { generateAccessToken } from '../../utils/jwt';
import { UserRepository } from '../../repositories/UserRepository';

// Mock dependencies
jest.mock('../../utils/jwt');
jest.mock('../../repositories/UserRepository');
jest.mock('../../config/database');

const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<typeof generateAccessToken>;
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    req = {
      headers: {},
      user: undefined
    };
    
    res = {
      status: mockStatus,
      json: mockJson
    };
    
    next = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and add user to request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        verificationStatus: {}
      };

      // Mock JWT verification
      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        type: 'access'
      });

      // Mock user repository
      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      req.headers!.authorization = 'Bearer valid-token';

      await authenticateToken(req as Request, res as Response, next);

      expect(req.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      });
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      await authenticateToken(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', async () => {
      req.headers!.authorization = 'InvalidFormat';

      await authenticateToken(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid JWT token', async () => {
      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue(null);

      req.headers!.authorization = 'Bearer invalid-token';

      await authenticateToken(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso inválido',
        code: 'INVALID_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject refresh token used as access token', async () => {
      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        type: 'refresh' // Wrong type
      });

      req.headers!.authorization = 'Bearer refresh-token';

      await authenticateToken(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token de acceso inválido',
        code: 'INVALID_TOKEN'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        type: 'access'
      });

      const mockFindById = jest.fn().mockResolvedValue(null);
      mockUserRepository.prototype.findById = mockFindById;

      req.headers!.authorization = 'Bearer valid-token';

      await authenticateToken(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without authentication when no token provided', async () => {
      await optionalAuth(req as Request, res as Response, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should authenticate valid token and continue', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        type: 'access'
      });

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      req.headers!.authorization = 'Bearer valid-token';

      await optionalAuth(req as Request, res as Response, next);

      expect(req.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      });
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should continue without authentication when token is invalid', async () => {
      const mockVerifyToken = require('../../utils/jwt').verifyToken;
      mockVerifyToken.mockReturnValue(null);

      req.headers!.authorization = 'Bearer invalid-token';

      await optionalAuth(req as Request, res as Response, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });

  describe('requireVerification', () => {
    it('should allow access when user has required verifications', async () => {
      const mockUser = {
        id: 'user-123',
        verificationStatus: {
          phoneVerified: true,
          identityVerified: true,
          backgroundCheckPassed: true
        }
      };

      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      };

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      const middleware = requireVerification(['phone', 'identity', 'background']);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject access when user lacks required verifications', async () => {
      const mockUser = {
        id: 'user-123',
        verificationStatus: {
          phoneVerified: true,
          identityVerified: false, // Missing
          backgroundCheckPassed: false // Missing
        }
      };

      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      };

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      const middleware = requireVerification(['phone', 'identity', 'background']);
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Verificaciones requeridas faltantes',
        code: 'INSUFFICIENT_VERIFICATION',
        details: {
          missing: ['Verificación de identidad', 'Verificación de antecedentes'],
          required: ['phone', 'identity', 'background']
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject access when user is not authenticated', async () => {
      const middleware = requireVerification(['phone']);
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTHENTICATION_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireValidBackgroundCheck', () => {
    it('should allow access when background check is valid and not expired', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

      const mockUser = {
        id: 'user-123',
        verificationStatus: {
          backgroundCheckPassed: true,
          backgroundCheckExpiryDate: futureDate
        }
      };

      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      };

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      await requireValidBackgroundCheck(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject access when background check is missing', async () => {
      const mockUser = {
        id: 'user-123',
        verificationStatus: {
          backgroundCheckPassed: false
        }
      };

      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      };

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      await requireValidBackgroundCheck(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Verificación de antecedentes requerida',
        code: 'BACKGROUND_CHECK_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject access when background check is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago

      const mockUser = {
        id: 'user-123',
        verificationStatus: {
          backgroundCheckPassed: true,
          backgroundCheckExpiryDate: pastDate
        }
      };

      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      };

      const mockFindById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.prototype.findById = mockFindById;

      await requireValidBackgroundCheck(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Verificación de antecedentes expirada. Renueva tu verificación.',
          code: 'BACKGROUND_CHECK_EXPIRED'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});