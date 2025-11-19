import {
   validateEmail,
   validateEcuadorPhone,
   validateEcuadorianCedula,
   validatePassport,
   validateName,
   validateDateOfBirth
} from '../../utils/validation';

describe('Validation Utils', () => {
   describe('validateEmail', () => {
      it('should validate correct email formats', () => {
         const validEmails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@example.org',
            'user123@test-domain.com'
         ];

         validEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject invalid email formats', () => {
         const invalidEmails = [
            '',
            'invalid-email',
            '@domain.com',
            'user@',
            'user@domain',
            'user name@domain.com'
         ];

         invalidEmails.forEach(email => {
            const result = validateEmail(email);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });

      it('should reject emails that are too long', () => {
         const longEmail = 'a'.repeat(250) + '@example.com';
         const result = validateEmail(longEmail);
         expect(result.isValid).toBe(false);
         expect(result.error).toContain('demasiado largo');
      });
   });

   describe('validateEcuadorPhone', () => {
      it('should validate and format Ecuador mobile numbers', () => {
         const validMobiles = [
            '+593987654321',
            '593987654321',
            '0987654321',
            '987654321',
            '+593 9 8765 4321',
            '0987-654-321'
         ];

         validMobiles.forEach(phone => {
            const result = validateEcuadorPhone(phone);
            expect(result.isValid).toBe(true);
            expect(result.formattedPhone).toBe('+593987654321');
            expect(result.error).toBeUndefined();
         });
      });

      it('should validate and format Ecuador landline numbers', () => {
         const validLandlines = [
            '+59322345678',
            '59322345678',
            '022345678',
            '22345678',
            '+593 2 234 5678'
         ];

         validLandlines.forEach(phone => {
            const result = validateEcuadorPhone(phone);
            expect(result.isValid).toBe(true);
            expect(result.formattedPhone).toBe('+59322345678');
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject invalid Ecuador phone numbers', () => {
         const invalidPhones = [
            '',
            '123456789',
            '+1234567890',
            '0123456789',
            '812345678', // Invalid first digit
            '98765432', // Too short
            '98765432101' // Too long
         ];

         invalidPhones.forEach(phone => {
            const result = validateEcuadorPhone(phone);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });
   });

   describe('validateEcuadorianCedula', () => {
      it('should validate correct Ecuadorian cedulas', () => {
         // These are valid cedula formats with correct check digits
         const validCedulas = [
            '1714616123', // Valid cedula from Pichincha
            '0926687856'  // Valid cedula from Guayas
         ];

         validCedulas.forEach(cedula => {
            const result = validateEcuadorianCedula(cedula);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject cedulas with invalid format', () => {
         const invalidCedulas = [
            '',
            '123456789', // Too short
            '12345678901', // Too long
            '2514616123', // Invalid province code
            '1764616123', // Invalid third digit
            '1714616124', // Invalid check digit
            '1803909467'  // Invalid check digit (from our test)
         ];

         invalidCedulas.forEach(cedula => {
            const result = validateEcuadorianCedula(cedula);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });

      it('should handle cedulas with formatting characters', () => {
         const result = validateEcuadorianCedula('171-461-612-3');
         expect(result.isValid).toBe(true);
      });
   });

   describe('validatePassport', () => {
      it('should validate correct passport formats', () => {
         const validPassports = [
            'AB123456',
            'XY9876543',
            'A1B2C3D4E',
            'ABC123'
         ];

         validPassports.forEach(passport => {
            const result = validatePassport(passport);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject invalid passport formats', () => {
         // Note: Spaces should be cleaned, so 'AB 123456' should be valid
         const result = validatePassport('AB 123456');
         expect(result.isValid).toBe(true);

         const invalidOnes = ['', 'AB12', 'ABCDEFGHIJ', 'AB-123456'];
         invalidOnes.forEach(passport => {
            const result = validatePassport(passport);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });
   });

   describe('validateName', () => {
      it('should validate correct names', () => {
         const validNames = [
            'Juan',
            'María José',
            'José-Luis',
            "O'Connor",
            'Ana Sofía',
            'Ñoño'
         ];

         validNames.forEach(name => {
            const result = validateName(name);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject invalid names', () => {
         const invalidNames = [
            '',
            'A', // Too short
            'A'.repeat(51), // Too long
            'Juan123', // Numbers
            'María@José', // Invalid characters
            '   ' // Only spaces
         ];

         invalidNames.forEach(name => {
            const result = validateName(name);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });

      it('should use custom field name in error messages', () => {
         const result = validateName('', 'apellido');
         expect(result.error).toContain('apellido');
      });
   });

   describe('validateDateOfBirth', () => {
      it('should validate correct dates of birth', () => {
         const validDates = [
            new Date('1990-01-01'),
            new Date('1985-12-31'),
            '1995-06-15',
            new Date(Date.now() - (25 * 365 * 24 * 60 * 60 * 1000)) // 25 years ago
         ];

         validDates.forEach(date => {
            const result = validateDateOfBirth(date);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
         });
      });

      it('should reject dates for users under 18', () => {
         const underageDate = new Date(Date.now() - (17 * 365 * 24 * 60 * 60 * 1000)); // 17 years ago
         const result = validateDateOfBirth(underageDate);
         expect(result.isValid).toBe(false);
         expect(result.error).toContain('mayor de 18 años');
      });

      it('should reject dates for users over 120', () => {
         const oldDate = new Date('1850-01-01'); // Very old date
         const result = validateDateOfBirth(oldDate);
         expect(result.isValid).toBe(false);
         expect(result.error).toContain('inválida');
      });

      it('should reject invalid date formats', () => {
         const invalidDates = [
            'invalid-date',
            '2023-13-01', // Invalid month
            '2023-01-32', // Invalid day
            new Date('invalid')
         ];

         invalidDates.forEach(date => {
            const result = validateDateOfBirth(date);
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
         });
      });
   });
});