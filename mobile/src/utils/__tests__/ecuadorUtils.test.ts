import {
  validateCedula,
  formatCedula,
  validatePassport,
  formatPassport,
  validateEcuadorPhone,
  formatEcuadorPhone,
  getWhatsAppUrl,
  getCityByName,
  getCitiesByProvince,
  formatCurrency,
  ECUADOR_CITIES,
} from '../ecuadorUtils';

describe('Ecuador Utilities', () => {
  describe('validateCedula', () => {
    it('should validate correct cedula numbers', () => {
      // Valid cedula examples (using Ecuador's algorithm)
      expect(validateCedula('1714616123')).toBe(true);
      expect(validateCedula('0926687856')).toBe(true);
    });

    it('should reject invalid cedula numbers', () => {
      expect(validateCedula('1234567890')).toBe(false);
      expect(validateCedula('123456789')).toBe(false); // Too short
      expect(validateCedula('12345678901')).toBe(false); // Too long
      expect(validateCedula('abcd567890')).toBe(false); // Contains letters
      expect(validateCedula('')).toBe(false); // Empty
      expect(validateCedula('2514616123')).toBe(false); // Invalid province code
    });
  });

  describe('formatCedula', () => {
    it('should format cedula with dashes', () => {
      expect(formatCedula('1714616123')).toBe('17-1461-6123');
      expect(formatCedula('092668785')).toBe('09-2668-785');
      expect(formatCedula('0926')).toBe('09-26');
      expect(formatCedula('09')).toBe('09-');
      expect(formatCedula('1')).toBe('1');
      expect(formatCedula('')).toBe('');
    });

    it('should remove non-digit characters', () => {
      expect(formatCedula('17-1461-6123')).toBe('17-1461-6123');
      expect(formatCedula('17.1461.6123')).toBe('17-1461-6123');
      expect(formatCedula('17 1461 6123')).toBe('17-1461-6123');
    });
  });

  describe('validatePassport', () => {
    it('should validate correct passport format', () => {
      expect(validatePassport('AB1234567')).toBe(true);
      expect(validatePassport('XY9876543')).toBe(true);
      expect(validatePassport('ab1234567')).toBe(true); // Should work with lowercase
    });

    it('should reject invalid passport format', () => {
      expect(validatePassport('A1234567')).toBe(false); // Only one letter
      expect(validatePassport('ABC123456')).toBe(false); // Three letters
      expect(validatePassport('AB123456')).toBe(false); // Too few digits
      expect(validatePassport('AB12345678')).toBe(false); // Too many digits
      expect(validatePassport('1234567AB')).toBe(false); // Wrong order
      expect(validatePassport('')).toBe(false); // Empty
    });
  });

  describe('formatPassport', () => {
    it('should format passport with dash', () => {
      expect(formatPassport('AB1234567')).toBe('AB-1234567');
      expect(formatPassport('ab1234567')).toBe('AB-1234567');
      expect(formatPassport('AB123')).toBe('AB-123');
      expect(formatPassport('AB')).toBe('AB-');
      expect(formatPassport('A')).toBe('A');
      expect(formatPassport('')).toBe('');
    });

    it('should handle spaces and convert to uppercase', () => {
      expect(formatPassport('AB 1234567')).toBe('AB-1234567');
      expect(formatPassport('ab 1234567')).toBe('AB-1234567');
    });
  });

  describe('validateEcuadorPhone', () => {
    it('should validate mobile numbers', () => {
      expect(validateEcuadorPhone('0987654321')).toBe(true);
      expect(validateEcuadorPhone('0912345678')).toBe(true);
      expect(validateEcuadorPhone('0998765432')).toBe(true);
    });

    it('should validate landline numbers', () => {
      expect(validateEcuadorPhone('022345678')).toBe(true);
      expect(validateEcuadorPhone('042345678')).toBe(true);
      expect(validateEcuadorPhone('072345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validateEcuadorPhone('123456789')).toBe(false); // Doesn't start with 0
      expect(validateEcuadorPhone('0987654')).toBe(false); // Too short
      expect(validateEcuadorPhone('098765432100')).toBe(false); // Too long
      expect(validateEcuadorPhone('0887654321')).toBe(false); // Invalid mobile prefix
      expect(validateEcuadorPhone('')).toBe(false); // Empty
    });
  });

  describe('formatEcuadorPhone', () => {
    it('should format mobile numbers', () => {
      expect(formatEcuadorPhone('0987654321')).toBe('0987-654-321');
      expect(formatEcuadorPhone('0912345678')).toBe('0912-345-678');
    });

    it('should format landline numbers', () => {
      expect(formatEcuadorPhone('022345678')).toBe('02-234-5678');
      expect(formatEcuadorPhone('042345678')).toBe('04-234-5678');
    });

    it('should handle partial numbers', () => {
      expect(formatEcuadorPhone('0987')).toBe('0987');
      expect(formatEcuadorPhone('02234')).toBe('02234');
    });

    it('should remove non-digit characters', () => {
      expect(formatEcuadorPhone('098-765-4321')).toBe('0987-654-321');
      expect(formatEcuadorPhone('(098) 765-4321')).toBe('0987-654-321');
    });
  });

  describe('getWhatsAppUrl', () => {
    it('should generate WhatsApp URL for mobile numbers', () => {
      const url = getWhatsAppUrl('0987654321', 'Hello');
      expect(url).toBe('https://wa.me/593987654321?text=Hello');
    });

    it('should generate WhatsApp URL for landline numbers', () => {
      const url = getWhatsAppUrl('022345678', 'Hello');
      expect(url).toBe('https://wa.me/59322345678?text=Hello');
    });

    it('should handle international format', () => {
      const url = getWhatsAppUrl('593987654321', 'Hello');
      expect(url).toBe('https://wa.me/593987654321?text=Hello');
    });

    it('should work without message', () => {
      const url = getWhatsAppUrl('0987654321');
      expect(url).toBe('https://wa.me/593987654321');
    });

    it('should encode message', () => {
      const url = getWhatsAppUrl('0987654321', 'Hello World!');
      expect(url).toBe('https://wa.me/593987654321?text=Hello%20World!');
    });
  });

  describe('getCityByName', () => {
    it('should find city by name', () => {
      const quito = getCityByName('Quito');
      expect(quito).toEqual({
        name: 'Quito',
        province: 'Pichincha',
        code: 'UIO'
      });
    });

    it('should be case insensitive', () => {
      const guayaquil = getCityByName('GUAYAQUIL');
      expect(guayaquil?.name).toBe('Guayaquil');
    });

    it('should return undefined for non-existent city', () => {
      const city = getCityByName('NonExistentCity');
      expect(city).toBeUndefined();
    });
  });

  describe('getCitiesByProvince', () => {
    it('should find cities by province', () => {
      const pichinchaCities = getCitiesByProvince('Pichincha');
      expect(pichinchaCities.length).toBeGreaterThan(0);
      expect(pichinchaCities.every(city => city.province === 'Pichincha')).toBe(true);
    });

    it('should be case insensitive', () => {
      const guayasCities = getCitiesByProvince('GUAYAS');
      expect(guayasCities.length).toBeGreaterThan(0);
      expect(guayasCities.every(city => city.province === 'Guayas')).toBe(true);
    });

    it('should return empty array for non-existent province', () => {
      const cities = getCitiesByProvince('NonExistentProvince');
      expect(cities).toEqual([]);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in USD for Ecuador', () => {
      expect(formatCurrency(25.50)).toBe('$25.50');
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('ECUADOR_CITIES', () => {
    it('should contain major Ecuador cities', () => {
      const cityNames = ECUADOR_CITIES.map(city => city.name);
      expect(cityNames).toContain('Quito');
      expect(cityNames).toContain('Guayaquil');
      expect(cityNames).toContain('Cuenca');
      expect(cityNames).toContain('Ambato');
      expect(cityNames).toContain('Manta');
    });

    it('should have proper structure for each city', () => {
      ECUADOR_CITIES.forEach(city => {
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('province');
        expect(city).toHaveProperty('code');
        expect(typeof city.name).toBe('string');
        expect(typeof city.province).toBe('string');
        expect(typeof city.code).toBe('string');
      });
    });
  });
});