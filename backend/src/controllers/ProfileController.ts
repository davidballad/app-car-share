import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { validateName, validateDateOfBirth } from '../utils/validation';

export class ProfileController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Update user profile
   * PUT /api/profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { firstName, lastName, dateOfBirth, profilePhoto } = req.body;

      // Validate input data
      const validationErrors: string[] = [];

      if (firstName) {
        const firstNameValidation = validateName(firstName, 'nombre');
        if (!firstNameValidation.isValid) {
          validationErrors.push(firstNameValidation.error!);
        }
      }

      if (lastName) {
        const lastNameValidation = validateName(lastName, 'apellido');
        if (!lastNameValidation.isValid) {
          validationErrors.push(lastNameValidation.error!);
        }
      }

      if (dateOfBirth) {
        const dobValidation = validateDateOfBirth(dateOfBirth);
        if (!dobValidation.isValid) {
          validationErrors.push(dobValidation.error!);
        }
      }

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Datos de perfil inválidos',
          details: validationErrors
        });
        return;
      }

      // Update user profile
      await this.userRepository.updateProfile(req.user.id, {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        profilePhoto
      });

      // Get updated profile
      const updatedProfile = await this.userRepository.getUserProfile(req.user.id);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: updatedProfile
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Upload profile photo
   * POST /api/profile/photo
   */
  uploadProfilePhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      // In a real implementation, this would handle file upload to cloud storage
      // For now, we'll simulate the process
      const { photoData, fileName } = req.body;

      if (!photoData || !fileName) {
        res.status(400).json({
          success: false,
          error: 'Datos de foto requeridos'
        });
        return;
      }

      // Validate file type (basic validation)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileType = photoData.split(';')[0].split(':')[1];

      if (!allowedTypes.includes(fileType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP.'
        });
        return;
      }

      // Simulate file upload to cloud storage
      const photoUrl = `https://storage.rideshare.ec/profiles/${req.user.id}/${fileName}`;

      // Update user profile with new photo URL
      await this.userRepository.updateProfile(req.user.id, {
        profilePhoto: photoUrl
      });

      res.json({
        success: true,
        message: 'Foto de perfil actualizada exitosamente',
        data: {
          photoUrl
        }
      });

    } catch (error) {
      console.error('Upload profile photo error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get user's own profile
   * GET /api/profile
   */
  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const profile = await this.userRepository.getUserProfile(req.user.id);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: 'Perfil no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: profile
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get another user's public profile
   * GET /api/profile/:userId
   */
  getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        });
        return;
      }

      const profile = await this.userRepository.getPublicProfile(userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: profile
        }
      });

    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Delete user account
   * DELETE /api/profile
   */
  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { password } = req.body;

      if (!password) {
        res.status(400).json({
          success: false,
          error: 'Contraseña requerida para eliminar cuenta'
        });
        return;
      }

      // Verify password before deletion
      const user = await this.userRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      const { comparePassword } = await import('../utils/password');
      const isPasswordValid = await comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Contraseña incorrecta'
        });
        return;
      }

      // Soft delete user account
      await this.userRepository.softDeleteUser(req.user.id);

      res.json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
}