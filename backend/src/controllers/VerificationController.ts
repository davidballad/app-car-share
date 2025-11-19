import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { VerificationRepository } from '../repositories/VerificationRepository';
import { validateEcuadorianCedula, validatePassport } from '../utils/validation';

export class VerificationController {
  private userRepository: UserRepository;
  private verificationRepository: VerificationRepository;

  constructor(userRepository: UserRepository, verificationRepository: VerificationRepository) {
    this.userRepository = userRepository;
    this.verificationRepository = verificationRepository;
  }

  /**
   * Get current user's verification status
   * GET /api/verification/status
   */
  getVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const user = await this.userRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      // Get detailed verification status
      const verificationDetails = await this.verificationRepository.getVerificationDetails(req.user.id);

      res.json({
        success: true,
        data: {
          verificationStatus: user.verificationStatus,
          details: verificationDetails,
          badges: this.calculateVerificationBadges(user.verificationStatus),
          nextSteps: this.getNextVerificationSteps(user.verificationStatus)
        }
      });

    } catch (error) {
      console.error('Get verification status error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Update phone verification status
   * POST /api/verification/phone
   */
  updatePhoneVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { verified } = req.body;

      if (typeof verified !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Estado de verificación inválido'
        });
        return;
      }

      // Update phone verification status
      await this.userRepository.updateVerificationStatus(req.user.id, {
        phoneVerified: verified
      });

      // Log verification event
      await this.verificationRepository.logVerificationEvent(req.user.id, 'phone', verified ? 'verified' : 'unverified');

      res.json({
        success: true,
        message: verified ? 'Teléfono verificado exitosamente' : 'Verificación de teléfono removida',
        data: {
          phoneVerified: verified
        }
      });

    } catch (error) {
      console.error('Update phone verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Submit identity verification
   * POST /api/verification/identity
   */
  submitIdentityVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { documentType, documentNumber, documentPhoto, fullName, dateOfBirth } = req.body;

      // Validate required fields
      if (!documentType || !documentNumber || !documentPhoto || !fullName || !dateOfBirth) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos',
          details: {
            documentType: !documentType ? 'Tipo de documento es requerido' : undefined,
            documentNumber: !documentNumber ? 'Número de documento es requerido' : undefined,
            documentPhoto: !documentPhoto ? 'Foto del documento es requerida' : undefined,
            fullName: !fullName ? 'Nombre completo es requerido' : undefined,
            dateOfBirth: !dateOfBirth ? 'Fecha de nacimiento es requerida' : undefined
          }
        });
        return;
      }

      // Validate document type
      if (!['cedula', 'passport'].includes(documentType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de documento inválido. Use "cedula" o "passport"'
        });
        return;
      }

      // Validate document number based on type
      let documentValidation;
      if (documentType === 'cedula') {
        documentValidation = validateEcuadorianCedula(documentNumber);
      } else {
        documentValidation = validatePassport(documentNumber);
      }

      if (!documentValidation.isValid) {
        res.status(400).json({
          success: false,
          error: documentValidation.error
        });
        return;
      }

      // Check if user already has pending or approved identity verification
      const existingVerification = await this.verificationRepository.getLatestIdentityVerification(req.user.id);
      if (existingVerification && existingVerification.status === 'pending') {
        res.status(409).json({
          success: false,
          error: 'Ya tienes una verificación de identidad pendiente'
        });
        return;
      }

      // Submit identity verification
      const verification = await this.verificationRepository.submitIdentityVerification({
        userId: req.user.id,
        documentType,
        documentNumber,
        documentPhoto,
        fullName: fullName.trim(),
        dateOfBirth: new Date(dateOfBirth)
      });

      res.status(201).json({
        success: true,
        message: 'Verificación de identidad enviada exitosamente',
        data: {
          verificationId: verification.id,
          status: verification.status,
          estimatedProcessingTime: '24-48 horas'
        }
      });

    } catch (error) {
      console.error('Submit identity verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get verification requirements for different actions
   * GET /api/verification/requirements/:action
   */
  getVerificationRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { action } = req.params;

      const requirements = this.getRequirementsForAction(action);

      if (!requirements) {
        res.status(400).json({
          success: false,
          error: 'Acción no válida'
        });
        return;
      }

      // If user is authenticated, check their current status
      let userStatus = null;
      if (req.user) {
        const user = await this.userRepository.findById(req.user.id);
        if (user) {
          userStatus = {
            current: user.verificationStatus,
            missing: this.getMissingVerifications(user.verificationStatus, requirements.required),
            canPerformAction: this.canPerformAction(user.verificationStatus, requirements.required)
          };
        }
      }

      res.json({
        success: true,
        data: {
          action,
          requirements,
          userStatus
        }
      });

    } catch (error) {
      console.error('Get verification requirements error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get verification history
   * GET /api/verification/history
   */
  getVerificationHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const history = await this.verificationRepository.getVerificationHistory(req.user.id, page, limit);

      res.json({
        success: true,
        data: {
          history: history.events,
          pagination: {
            page,
            limit,
            total: history.total,
            totalPages: Math.ceil(history.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get verification history error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Calculate verification badges based on status
   */
  private calculateVerificationBadges(verificationStatus: any): string[] {
    const badges: string[] = [];

    if (verificationStatus.phoneVerified) {
      badges.push('phone_verified');
    }

    if (verificationStatus.identityVerified) {
      badges.push('identity_verified');
    }

    if (verificationStatus.backgroundCheckPassed) {
      // Check if background check is not expired
      if (verificationStatus.backgroundCheckExpiryDate) {
        const expiryDate = new Date(verificationStatus.backgroundCheckExpiryDate);
        const now = new Date();
        if (now <= expiryDate) {
          badges.push('background_verified');
        } else {
          badges.push('background_expired');
        }
      } else {
        badges.push('background_verified');
      }
    }

    if (verificationStatus.driverLicenseVerified) {
      badges.push('driver_verified');
    }

    if (verificationStatus.vehicleRegistrationVerified) {
      badges.push('vehicle_verified');
    }

    // Special badges
    if (badges.includes('phone_verified') && badges.includes('identity_verified') && badges.includes('background_verified')) {
      badges.push('fully_verified');
    }

    if (badges.includes('driver_verified') && badges.includes('vehicle_verified')) {
      badges.push('driver_ready');
    }

    return badges;
  }

  /**
   * Get next verification steps for user
   */
  private getNextVerificationSteps(verificationStatus: any): Array<{
    step: string;
    title: string;
    description: string;
    required: boolean;
    completed: boolean;
  }> {
    const steps = [
      {
        step: 'phone',
        title: 'Verificar teléfono',
        description: 'Confirma tu número de teléfono con un código SMS',
        required: true,
        completed: verificationStatus.phoneVerified || false
      },
      {
        step: 'identity',
        title: 'Verificar identidad',
        description: 'Sube una foto de tu cédula o pasaporte',
        required: true,
        completed: verificationStatus.identityVerified || false
      },
      {
        step: 'background',
        title: 'Verificación de antecedentes',
        description: 'Verificación de antecedentes penales en Ecuador',
        required: true,
        completed: this.isBackgroundCheckValid(verificationStatus)
      },
      {
        step: 'driver',
        title: 'Licencia de conducir',
        description: 'Sube una foto de tu licencia de conducir (solo para conductores)',
        required: false,
        completed: verificationStatus.driverLicenseVerified || false
      },
      {
        step: 'vehicle',
        title: 'Registro de vehículo',
        description: 'Sube los documentos de tu vehículo (solo para conductores)',
        required: false,
        completed: verificationStatus.vehicleRegistrationVerified || false
      }
    ];

    return steps;
  }

  /**
   * Check if background check is valid and not expired
   */
  private isBackgroundCheckValid(verificationStatus: any): boolean {
    if (!verificationStatus.backgroundCheckPassed) {
      return false;
    }

    if (verificationStatus.backgroundCheckExpiryDate) {
      const expiryDate = new Date(verificationStatus.backgroundCheckExpiryDate);
      const now = new Date();
      return now <= expiryDate;
    }

    return true;
  }

  /**
   * Get verification requirements for specific actions
   */
  private getRequirementsForAction(action: string): {
    required: string[];
    optional: string[];
    description: string;
  } | null {
    const requirements: { [key: string]: { required: string[]; optional: string[]; description: string; } } = {
      'book_ride': {
        required: ['phone', 'identity', 'background'],
        optional: [],
        description: 'Para reservar un viaje como pasajero'
      },
      'create_trip': {
        required: ['phone', 'identity', 'background', 'driver', 'vehicle'],
        optional: [],
        description: 'Para crear un viaje como conductor'
      },
      'send_message': {
        required: ['phone'],
        optional: ['identity'],
        description: 'Para enviar mensajes a otros usuarios'
      },
      'leave_review': {
        required: ['phone', 'identity'],
        optional: [],
        description: 'Para dejar evaluaciones de otros usuarios'
      }
    };

    return requirements[action] || null;
  }

  /**
   * Get missing verifications for user
   */
  private getMissingVerifications(userStatus: any, required: string[]): string[] {
    const missing: string[] = [];

    for (const requirement of required) {
      switch (requirement) {
        case 'phone':
          if (!userStatus.phoneVerified) missing.push('phone');
          break;
        case 'identity':
          if (!userStatus.identityVerified) missing.push('identity');
          break;
        case 'background':
          if (!this.isBackgroundCheckValid(userStatus)) missing.push('background');
          break;
        case 'driver':
          if (!userStatus.driverLicenseVerified) missing.push('driver');
          break;
        case 'vehicle':
          if (!userStatus.vehicleRegistrationVerified) missing.push('vehicle');
          break;
      }
    }

    return missing;
  }

  /**
   * Check if user can perform action based on verification status
   */
  private canPerformAction(userStatus: any, required: string[]): boolean {
    const missing = this.getMissingVerifications(userStatus, required);
    return missing.length === 0;
  }
}