import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { SmsService } from '../services/SmsService';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { 
  validateEmail, 
  validateEcuadorPhone, 
  validateName, 
  validateDateOfBirth 
} from '../utils/validation';
import { generateTokenPair, verifyToken } from '../utils/jwt';
import { CreateUserRequest } from '../models/User';

export class AuthController {
  private userRepository: UserRepository;
  private smsService: SmsService;

  constructor(userRepository: UserRepository, smsService: SmsService) {
    this.userRepository = userRepository;
    this.smsService = smsService;
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, password, firstName, lastName, dateOfBirth } = req.body;

      // Validate required fields
      if (!email || !phone || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos requeridos deben ser completados',
          details: {
            email: !email ? 'Email es requerido' : undefined,
            phone: !phone ? 'Teléfono es requerido' : undefined,
            password: !password ? 'Contraseña es requerida' : undefined,
            firstName: !firstName ? 'Nombre es requerido' : undefined,
            lastName: !lastName ? 'Apellido es requerido' : undefined
          }
        });
        return;
      }

      // Validate email format
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          error: emailValidation.error
        });
        return;
      }

      // Validate and format phone number
      const phoneValidation = validateEcuadorPhone(phone);
      if (!phoneValidation.isValid) {
        res.status(400).json({
          success: false,
          error: phoneValidation.error
        });
        return;
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Contraseña no cumple con los requisitos de seguridad',
          details: passwordValidation.errors
        });
        return;
      }

      // Validate names
      const firstNameValidation = validateName(firstName, 'nombre');
      if (!firstNameValidation.isValid) {
        res.status(400).json({
          success: false,
          error: firstNameValidation.error
        });
        return;
      }

      const lastNameValidation = validateName(lastName, 'apellido');
      if (!lastNameValidation.isValid) {
        res.status(400).json({
          success: false,
          error: lastNameValidation.error
        });
        return;
      }

      // Validate date of birth if provided
      if (dateOfBirth) {
        const dobValidation = validateDateOfBirth(dateOfBirth);
        if (!dobValidation.isValid) {
          res.status(400).json({
            success: false,
            error: dobValidation.error
          });
          return;
        }
      }

      // Check if email already exists
      const existingEmailUser = await this.userRepository.findByEmail(email.toLowerCase());
      if (existingEmailUser) {
        res.status(409).json({
          success: false,
          error: 'Ya existe una cuenta con este email'
        });
        return;
      }

      // Check if phone already exists
      const formattedPhone = phoneValidation.formattedPhone!;
      const existingPhoneUser = await this.userRepository.findByPhone(formattedPhone);
      if (existingPhoneUser) {
        res.status(409).json({
          success: false,
          error: 'Ya existe una cuenta con este número de teléfono'
        });
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user data
      const userData: CreateUserRequest & { passwordHash: string } = {
        email: email.toLowerCase(),
        phone: formattedPhone,
        password,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      };

      // Create user in database
      const newUser = await this.userRepository.createUser(userData);

      // Generate JWT tokens
      const tokens = generateTokenPair(newUser.id, newUser.email);

      // Get user profile (without sensitive data)
      const userProfile = await this.userRepository.getUserProfile(newUser.id);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userProfile,
          tokens
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Send phone verification code
   * POST /api/auth/send-verification
   */
  sendPhoneVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({
          success: false,
          error: 'Número de teléfono es requerido'
        });
        return;
      }

      // Validate and format phone number
      const phoneValidation = validateEcuadorPhone(phone);
      if (!phoneValidation.isValid) {
        res.status(400).json({
          success: false,
          error: phoneValidation.error
        });
        return;
      }

      const formattedPhone = phoneValidation.formattedPhone!;

      // Send SMS verification code
      const smsResult = await this.smsService.sendVerificationCode(formattedPhone);

      if (!smsResult.success) {
        res.status(500).json({
          success: false,
          error: smsResult.error || 'Error al enviar código de verificación'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código de verificación enviado exitosamente',
        data: {
          phone: formattedPhone,
          verificationId: smsResult.verificationId
        }
      });

    } catch (error) {
      console.error('Send verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Verify phone number with SMS code
   * POST /api/auth/verify-phone
   */
  verifyPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, code, userId } = req.body;

      if (!phone || !code) {
        res.status(400).json({
          success: false,
          error: 'Teléfono y código de verificación son requeridos'
        });
        return;
      }

      // Validate phone format
      const phoneValidation = validateEcuadorPhone(phone);
      if (!phoneValidation.isValid) {
        res.status(400).json({
          success: false,
          error: phoneValidation.error
        });
        return;
      }

      const formattedPhone = phoneValidation.formattedPhone!;

      // Verify SMS code
      const verificationResult = await this.smsService.verifyCode(formattedPhone, code);

      if (!verificationResult.success) {
        res.status(500).json({
          success: false,
          error: verificationResult.error || 'Error al verificar código'
        });
        return;
      }

      if (!verificationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Código de verificación inválido'
        });
        return;
      }

      // If userId is provided, update user's phone verification status
      if (userId) {
        await this.userRepository.updateVerificationStatus(userId, {
          phoneVerified: true
        });
      }

      res.json({
        success: true,
        message: 'Teléfono verificado exitosamente',
        data: {
          phoneVerified: true
        }
      });

    } catch (error) {
      console.error('Phone verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token es requerido'
        });
        return;
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken);
      
      if (!decoded || decoded.type !== 'refresh') {
        res.status(401).json({
          success: false,
          error: 'Refresh token inválido'
        });
        return;
      }

      // Verify user still exists
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      // Generate new token pair
      const tokens = generateTokenPair(user.id, user.email);

      res.json({
        success: true,
        message: 'Tokens renovados exitosamente',
        data: {
          tokens
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Refresh token inválido'
      });
    }
  };

  /**
   * User login
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email.toLowerCase());
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
        return;
      }

      // Generate JWT tokens
      const tokens = generateTokenPair(user.id, user.email);

      // Get user profile (without sensitive data)
      const userProfile = await this.userRepository.getUserProfile(user.id);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userProfile,
          tokens
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      // Get user profile
      const userProfile = await this.userRepository.getUserProfile(req.user.id);
      
      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: userProfile
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * User logout (client-side token invalidation)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the tokens from storage. However, we can log the event.
      
      if (req.user) {
        console.log(`User ${req.user.email} logged out`);
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
}