import { EcuadorBackgroundCheckService } from '../../services/EcuadorBackgroundCheckService';

describe('EcuadorBackgroundCheckService', () => {
  let service: EcuadorBackgroundCheckService;

  beforeEach(() => {
    service = new EcuadorBackgroundCheckService();
  });

  describe('validateCedula', () => {
    it('should validate correct cedula', () => {
      // Valid cedula from Pichincha province (17)
      const result = service.validateCedula('1714616123');
      expect(result.isValid).toBe(true);
      expect(result.formattedCedula).toBe('1714616123');
    });

    it('should reject cedula with wrong length', () => {
      const result = service.validateCedula('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cedula must be exactly 10 digits');
    });

    it('should reject cedula with invalid province code', () => {
      const result = service.validateCedula('2514616123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid province code. Must be between 01-24');
    });

    it('should reject cedula with invalid third digit', () => {
      const result = service.validateCedula('1764616123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid cedula format for natural person');
    });

    it('should reject cedula with wrong check digit', () => {
      const result = service.validateCedula('1714616124');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid check digit');
    });

    it('should handle cedula with non-numeric characters', () => {
      const result = service.validateCedula('171-461-6123');
      expect(result.isValid).toBe(true);
      expect(result.formattedCedula).toBe('1714616123');
    });
  });

  describe('validatePassport', () => {
    it('should validate correct passport', () => {
      const result = service.validatePassport('AB1234567');
      expect(result.isValid).toBe(true);
      expect(result.formattedPassport).toBe('AB1234567');
    });

    it('should reject passport that is too short', () => {
      const result = service.validatePassport('AB123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passport must be between 6-12 characters');
    });

    it('should reject passport that is too long', () => {
      const result = service.validatePassport('AB1234567890123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passport must be between 6-12 characters');
    });

    it('should reject passport with invalid characters', () => {
      const result = service.validatePassport('AB123-456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passport must contain only letters and numbers');
    });

    it('should handle lowercase passport', () => {
      const result = service.validatePassport('ab1234567');
      expect(result.isValid).toBe(true);
      expect(result.formattedPassport).toBe('AB1234567');
    });
  });
});