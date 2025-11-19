import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 characters
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Due to salt, hashes should be different
    });

    it('should handle empty password', async () => {
      await expect(hashPassword('')).resolves.toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword('', hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash';
      
      // bcrypt.compare returns false for invalid hashes instead of throwing
      const isMatch = await comparePassword(password, invalidHash);
      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'MyStr0ng!Password',
        'Secure123@Pass',
        'C0mplex#Password1',
        'Valid8Pass!word'
      ];

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject passwords that are too short', () => {
      const shortPassword = 'Short1!';
      const result = validatePasswordStrength(shortPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'A'.repeat(129) + '1!';
      const result = validatePasswordStrength(longPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña no puede tener más de 128 caracteres');
    });

    it('should reject passwords without lowercase letters', () => {
      const password = 'PASSWORD123!';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra minúscula');
    });

    it('should reject passwords without uppercase letters', () => {
      const password = 'password123!';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
    });

    it('should reject passwords without numbers', () => {
      const password = 'Password!';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('should reject passwords without special characters', () => {
      const password = 'Password123';
      const result = validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });

    it('should reject common weak passwords', () => {
      const commonPasswords = [
        'password',
        'Password123',
        '123456',
        'qwerty',
        'abc123'
      ];

      commonPasswords.forEach(password => {
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('demasiado común'))).toBe(true);
      });
    });

    it('should return multiple errors for very weak passwords', () => {
      const weakPassword = 'weak';
      const result = validatePasswordStrength(weakPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula');
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
      expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });

    it('should handle empty password', () => {
      const result = validatePasswordStrength('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});