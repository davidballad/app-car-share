import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserRepository } from '../repositories/UserRepository';
import { SmsService } from '../services/SmsService';
import { getPool } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Lazy initialization of dependencies
let authController: AuthController;

function getAuthController(): AuthController {
  if (!authController) {
    const pool = getPool();
    const userRepository = new UserRepository(pool);
    const smsService = new SmsService();
    authController = new AuthController(userRepository, smsService);
  }
  return authController;
}

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => getAuthController().register(req, res));

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', (req, res) => getAuthController().login(req, res));

/**
 * @route POST /api/auth/send-verification
 * @desc Send SMS verification code to phone number
 * @access Public
 */
router.post('/send-verification', (req, res) => getAuthController().sendPhoneVerification(req, res));

/**
 * @route POST /api/auth/verify-phone
 * @desc Verify phone number with SMS code
 * @access Public
 */
router.post('/verify-phone', (req, res) => getAuthController().verifyPhone(req, res));

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', (req, res) => getAuthController().refreshToken(req, res));

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, (req, res) => getAuthController().getCurrentUser(req, res));

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', authenticateToken, (req, res) => getAuthController().logout(req, res));

export default router;