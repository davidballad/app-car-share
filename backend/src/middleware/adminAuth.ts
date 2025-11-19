import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has admin role
 * Should be used after authenticateToken middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // Check if user has admin role
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has admin or moderator role
 */
export const requireModerator = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // Check if user has admin or moderator role
  if (!['admin', 'moderator'].includes(req.user?.role || '')) {
    res.status(403).json({
      success: false,
      error: 'Moderator access required'
    });
    return;
  }

  next();
};