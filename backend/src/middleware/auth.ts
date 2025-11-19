import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UserRepository } from '../repositories/UserRepository';
import { getPool } from '../config/database';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isAuthenticated: boolean;
        role?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    isAuthenticated: boolean;
    role?: string;
  };
}

/**
 * Authentication middleware to verify JWT tokens
 * Adds user information to request object if token is valid
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'access') {
      res.status(401).json({
        success: false,
        error: 'Token de acceso inválido',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    // Verify user still exists in database
    const userRepository = new UserRepository(getPool());
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      isAuthenticated: true
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Token de acceso inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user information if token is present and valid, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      req.user = undefined;
      next();
      return;
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'access') {
      // Invalid token, continue without authentication
      req.user = undefined;
      next();
      return;
    }

    // Verify user exists
    const userRepository = new UserRepository(getPool());
    const user = await userRepository.findById(decoded.userId);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        isAuthenticated: true
      };
    }

    next();
  } catch (error) {
    // On error, continue without authentication
    req.user = undefined;
    next();
  }
};

/**
 * Middleware to require specific verification status
 * Must be used after authenticateToken middleware
 */
export const requireVerification = (verificationTypes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Autenticación requerida',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      // Get user's verification status
      const userRepository = new UserRepository(getPool());
      const user = await userRepository.findById(req.user.id);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Check required verifications
      const missingVerifications: string[] = [];
      
      for (const verificationType of verificationTypes) {
        switch (verificationType) {
          case 'phone':
            if (!user.verificationStatus.phoneVerified) {
              missingVerifications.push('Verificación de teléfono');
            }
            break;
          case 'identity':
            if (!user.verificationStatus.identityVerified) {
              missingVerifications.push('Verificación de identidad');
            }
            break;
          case 'background':
            if (!user.verificationStatus.backgroundCheckPassed) {
              missingVerifications.push('Verificación de antecedentes');
            }
            break;
          case 'driver':
            if (!user.verificationStatus.driverLicenseVerified) {
              missingVerifications.push('Licencia de conducir');
            }
            break;
          case 'vehicle':
            if (!user.verificationStatus.vehicleRegistrationVerified) {
              missingVerifications.push('Registro de vehículo');
            }
            break;
        }
      }

      if (missingVerifications.length > 0) {
        res.status(403).json({
          success: false,
          error: 'Verificaciones requeridas faltantes',
          code: 'INSUFFICIENT_VERIFICATION',
          details: {
            missing: missingVerifications,
            required: verificationTypes
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Verification middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware to check if background check is not expired
 * Must be used after authenticateToken middleware
 */
export const requireValidBackgroundCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    const userRepository = new UserRepository(getPool());
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Check if background check exists and is not expired
    if (!user.verificationStatus.backgroundCheckPassed) {
      res.status(403).json({
        success: false,
        error: 'Verificación de antecedentes requerida',
        code: 'BACKGROUND_CHECK_REQUIRED'
      });
      return;
    }

    // Check if background check is expired (90 days)
    if (user.verificationStatus.backgroundCheckExpiryDate) {
      const expiryDate = new Date(user.verificationStatus.backgroundCheckExpiryDate);
      const now = new Date();

      if (now > expiryDate) {
        res.status(403).json({
          success: false,
          error: 'Verificación de antecedentes expirada. Renueva tu verificación.',
          code: 'BACKGROUND_CHECK_EXPIRED',
          details: {
            expiryDate: expiryDate.toISOString(),
            daysExpired: Math.floor((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Background check middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};