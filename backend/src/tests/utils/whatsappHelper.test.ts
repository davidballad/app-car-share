import { generateWhatsAppURL, isValidEcuadorPhone, formatEcuadorPhone } from '../../utils/whatsappHelper';

describe('WhatsApp Helper', () => {
  describe('generateWhatsAppURL', () => {
    it('should generate correct WhatsApp URL for Ecuador mobile number', () => {
      const url = generateWhatsAppURL('0987654321');
      expect(url).toBe('https://wa.me/593987654321');
    });

    it('should generate URL with message', () => {
      const url = generateWhatsAppURL('0987654321', 'Hola!');
      expect(url).toBe('https://wa.me/593987654321?text=Hola!');
    });

    it('should handle number with country code', () => {
      const url = generateWhatsAppURL('593987654321');
      expect(url).toBe('https://wa.me/593987654321');
    });
  });

  describe('isValidEcuadorPhone', () => {
    it('should validate Ecuador mobile numbers', () => {
      expect(isValidEcuadorPhone('0987654321')).toBe(true);
      expect(isValidEcuadorPhone('593987654321')).toBe(true);
    });

    it('should validate Ecuador landline numbers', () => {
      expect(isValidEcuadorPhone('022345678')).toBe(true);
      expect(isValidEcuadorPhone('59322345678')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidEcuadorPhone('123456')).toBe(false);
      expect(isValidEcuadorPhone('0812345678')).toBe(false);
    });
  });

  describe('formatEcuadorPhone', () => {
    it('should format mobile numbers correctly', () => {
      expect(formatEcuadorPhone('0987654321')).toBe('0987-654-321');
    });

    it('should format landline numbers correctly', () => {
      expect(formatEcuadorPhone('022345678')).toBe('02-234-5678');
    });
  });
});