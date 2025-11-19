import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Generate access token for user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT access token
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ecuador-rideshare',
    audience: 'ecuador-rideshare-users'
  } as jwt.SignOptions);
}

/**
 * Generate refresh token for user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT refresh token
 */
export function generateRefreshToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'ecuador-rideshare',
    audience: 'ecuador-rideshare-users'
  } as jwt.SignOptions);
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ecuador-rideshare',
      audience: 'ecuador-rideshare-users'
    } as jwt.VerifyOptions) as JWTPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Generate both access and refresh tokens
 * @param userId - User ID
 * @param email - User email
 * @returns Object with access and refresh tokens
 */
export function generateTokenPair(userId: string, email: string): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email)
  };
}