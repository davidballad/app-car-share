import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { UserRepository } from '../repositories/UserRepository';
import { getPool } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Lazy initialization of dependencies
let profileController: ProfileController;

function getProfileController(): ProfileController {
  if (!profileController) {
    const pool = getPool();
    const userRepository = new UserRepository(pool);
    profileController = new ProfileController(userRepository);
  }
  return profileController;
}

/**
 * @route GET /api/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => getProfileController().getMyProfile(req, res));

/**
 * @route PUT /api/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/', authenticateToken, (req, res) => getProfileController().updateProfile(req, res));

/**
 * @route POST /api/profile/photo
 * @desc Upload profile photo
 * @access Private
 */
router.post('/photo', authenticateToken, (req, res) => getProfileController().uploadProfilePhoto(req, res));

/**
 * @route GET /api/profile/:userId
 * @desc Get another user's public profile
 * @access Public (but can be enhanced with optional auth)
 */
router.get('/:userId', optionalAuth, (req, res) => getProfileController().getUserProfile(req, res));

/**
 * @route DELETE /api/profile
 * @desc Delete user account
 * @access Private
 */
router.delete('/', authenticateToken, (req, res) => getProfileController().deleteAccount(req, res));

export default router;