/**
 * Validation utilities for user data with Ecuador-specific validations
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns boolean - True if email is valid
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'El email es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'El email es demasiado largo' };
  }

  return { isValid: true };
}

/**
 * Validate Ecuador phone number format
 * Supports: +593XXXXXXXXX, 593XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX
 * @param phone - Phone number to validate
 * @returns object with validation result and formatted phone
 */
export function validateEcuadorPhone(phone: string): { 
  isValid: boolean; 
  error?: string; 
  formattedPhone?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'El número de teléfono es requerido' };
  }

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Ecuador phone number patterns
  let ecuadorPhone = '';

  if (cleanPhone.startsWith('+593')) {
    // +593XXXXXXXXX format
    ecuadorPhone = cleanPhone.substring(4);
  } else if (cleanPhone.startsWith('593')) {
    // 593XXXXXXXXX format
    ecuadorPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('0')) {
    // 0XXXXXXXXX format (national)
    ecuadorPhone = cleanPhone.substring(1);
  } else {
    // XXXXXXXXX format (local)
    ecuadorPhone = cleanPhone;
  }

  // Validate Ecuador phone number format
  // Mobile: 9XXXXXXXX (9 digits starting with 9)
  // Landline: 2XXXXXXX, 3XXXXXXX, 4XXXXXXX, 5XXXXXXX, 6XXXXXXX, 7XXXXXXX (8 digits)
  const mobileRegex = /^9\d{8}$/; // 9 digits starting with 9
  const landlineRegex = /^[2-7]\d{7}$/; // 8 digits starting with 2-7

  if (!mobileRegex.test(ecuadorPhone) && !landlineRegex.test(ecuadorPhone)) {
    return { 
      isValid: false, 
      error: 'Número de teléfono ecuatoriano inválido. Use formato: 09XXXXXXXX (móvil) o 0XXXXXXXX (fijo)' 
    };
  }

  // Return formatted phone with Ecuador country code
  const formattedPhone = `+593${ecuadorPhone}`;

  return { 
    isValid: true, 
    formattedPhone 
  };
}

/**
 * Validate Ecuadorian Cedula using official algorithm
 * @param cedula - Cedula number to validate
 * @returns object with validation result
 */
export function validateEcuadorianCedula(cedula: string): { 
  isValid: boolean; 
  error?: string; 
} {
  if (!cedula || typeof cedula !== 'string') {
    return { isValid: false, error: 'La cédula es requerida' };
  }

  // Remove any non-digit characters
  const cleanCedula = cedula.replace(/\D/g, '');

  // Must be exactly 10 digits
  if (cleanCedula.length !== 10) {
    return { isValid: false, error: 'La cédula debe tener exactamente 10 dígitos' };
  }

  // First two digits must be valid province code (01-24)
  const provinceCode = parseInt(cleanCedula.substring(0, 2));
  if (provinceCode < 1 || provinceCode > 24) {
    return { isValid: false, error: 'Código de provincia inválido en la cédula' };
  }

  // Third digit must be less than 6 (for natural persons)
  const thirdDigit = parseInt(cleanCedula.charAt(2));
  if (thirdDigit >= 6) {
    return { isValid: false, error: 'Tercer dígito de cédula inválido' };
  }

  // Validate check digit using Ecuador's algorithm
  const digits = cleanCedula.split('').map(Number);
  const checkDigit = digits[9];
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = digits[i];
    
    // Multiply odd positions (1st, 3rd, 5th, 7th, 9th) by 2
    if (i % 2 === 0) {
      digit *= 2;
      // If result is greater than 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
  }

  // Calculate expected check digit
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  if (checkDigit !== expectedCheckDigit) {
    return { isValid: false, error: 'Dígito verificador de cédula inválido' };
  }

  return { isValid: true };
}

/**
 * Validate passport number format
 * @param passport - Passport number to validate
 * @returns object with validation result
 */
export function validatePassport(passport: string): { 
  isValid: boolean; 
  error?: string; 
} {
  if (!passport || typeof passport !== 'string') {
    return { isValid: false, error: 'El número de pasaporte es requerido' };
  }

  // Remove spaces and convert to uppercase
  const cleanPassport = passport.replace(/\s/g, '').toUpperCase();

  // Passport should be 6-9 alphanumeric characters
  const passportRegex = /^[A-Z0-9]{6,9}$/;
  
  if (!passportRegex.test(cleanPassport)) {
    return { 
      isValid: false, 
      error: 'Número de pasaporte inválido. Debe contener 6-9 caracteres alfanuméricos' 
    };
  }

  return { isValid: true };
}

/**
 * Validate user name (first name or last name)
 * @param name - Name to validate
 * @param fieldName - Field name for error messages
 * @returns object with validation result
 */
export function validateName(name: string, fieldName: string = 'nombre'): { 
  isValid: boolean; 
  error?: string; 
} {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `El ${fieldName} es requerido` };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: `El ${fieldName} debe tener al menos 2 caracteres` };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: `El ${fieldName} no puede tener más de 50 caracteres` };
  }

  // Allow letters, spaces, hyphens, and apostrophes (for names like María José, O'Connor)
  const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']+$/;
  
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      error: `El ${fieldName} solo puede contener letras, espacios, guiones y apostrofes` 
    };
  }

  return { isValid: true };
}

/**
 * Validate date of birth
 * @param dateOfBirth - Date to validate
 * @returns object with validation result
 */
export function validateDateOfBirth(dateOfBirth: Date | string): { 
  isValid: boolean; 
  error?: string; 
} {
  if (!dateOfBirth) {
    return { isValid: false, error: 'La fecha de nacimiento es requerida' };
  }

  const date = new Date(dateOfBirth);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Fecha de nacimiento inválida' };
  }

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) 
    ? age - 1 
    : age;

  if (actualAge < 18) {
    return { isValid: false, error: 'Debes ser mayor de 18 años para registrarte' };
  }

  if (date.getFullYear() < 1900 || actualAge > 120) {
    return { isValid: false, error: 'Fecha de nacimiento inválida' };
  }

  return { isValid: true };
}