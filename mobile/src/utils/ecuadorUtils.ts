/**
 * Ecuador-specific utility functions
 */

// Ecuador cities with their provinces
export const ECUADOR_CITIES = [
  { name: 'Quito', province: 'Pichincha', code: 'UIO' },
  { name: 'Guayaquil', province: 'Guayas', code: 'GYE' },
  { name: 'Cuenca', province: 'Azuay', code: 'CUE' },
  { name: 'Ambato', province: 'Tungurahua', code: 'AMB' },
  { name: 'Manta', province: 'Manabí', code: 'MAN' },
  { name: 'Portoviejo', province: 'Manabí', code: 'PVO' },
  { name: 'Machala', province: 'El Oro', code: 'MCH' },
  { name: 'Durán', province: 'Guayas', code: 'DUR' },
  { name: 'Esmeraldas', province: 'Esmeraldas', code: 'ESM' },
  { name: 'Riobamba', province: 'Chimborazo', code: 'RIO' },
  { name: 'Ibarra', province: 'Imbabura', code: 'IBA' },
  { name: 'Loja', province: 'Loja', code: 'LOJ' },
  { name: 'Babahoyo', province: 'Los Ríos', code: 'BAB' },
  { name: 'Quevedo', province: 'Los Ríos', code: 'QUE' },
  { name: 'Milagro', province: 'Guayas', code: 'MIL' },
  { name: 'Latacunga', province: 'Cotopaxi', code: 'LAT' },
  { name: 'Tulcán', province: 'Carchi', code: 'TUL' },
  { name: 'Sangolquí', province: 'Pichincha', code: 'SAN' },
  { name: 'Otavalo', province: 'Imbabura', code: 'OTA' },
  { name: 'Salinas', province: 'Santa Elena', code: 'SAL' },
];

// Ecuador provinces
export const ECUADOR_PROVINCES = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana',
  'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
  'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

/**
 * Validate Ecuador cedula (identity card) number
 * Uses the official Ecuador cedula validation algorithm
 */
export const validateCedula = (cedula: string): boolean => {
  if (!cedula || cedula.length !== 10) {
    return false;
  }

  // Check if all characters are digits
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Extract digits
  const digits = cedula.split('').map(Number);
  
  // Check province code (first two digits)
  const provinceCode = parseInt(cedula.substring(0, 2));
  if (provinceCode < 1 || provinceCode > 24) {
    return false;
  }

  // Check third digit (must be less than 6 for natural persons)
  if (digits[2] >= 6) {
    return false;
  }

  // Calculate check digit using Ecuador's algorithm
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let product = digits[i] * coefficients[i];
    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
  }

  const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return checkDigit === digits[9];
};

/**
 * Format Ecuador cedula number with dashes
 */
export const formatCedula = (cedula: string): string => {
  if (!cedula) return '';
  
  // Remove any non-digit characters
  const cleaned = cedula.replace(/\D/g, '');
  
  // Format as XX-XXXX-XXXX
  if (cleaned.length >= 10) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length >= 6) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
  }
  
  return cleaned;
};

/**
 * Validate Ecuador passport number
 */
export const validatePassport = (passport: string): boolean => {
  if (!passport) return false;
  
  // Ecuador passport format: 2 letters + 7 digits
  const passportRegex = /^[A-Z]{2}\d{7}$/;
  return passportRegex.test(passport.toUpperCase());
};

/**
 * Format Ecuador passport number
 */
export const formatPassport = (passport: string): string => {
  if (!passport) return '';
  
  // Remove spaces and convert to uppercase
  const cleaned = passport.replace(/\s/g, '').toUpperCase();
  
  // Format as AA-1234567
  if (cleaned.length >= 9) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 9)}`;
  } else if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
  }
  
  return cleaned;
};

/**
 * Validate Ecuador phone number
 * Formats: 09XXXXXXXX (mobile) or 0XXXXXXXX (landline)
 */
export const validateEcuadorPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check mobile format: 09XXXXXXXX (10 digits starting with 09)
  if (cleaned.length === 10 && cleaned.startsWith('09')) {
    return true;
  }
  
  // Check landline format: 0XXXXXXXX (9 digits starting with 0, but not 09)
  if (cleaned.length === 9 && cleaned.startsWith('0') && !cleaned.startsWith('09')) {
    return true;
  }
  
  return false;
};

/**
 * Format Ecuador phone number
 */
export const formatEcuadorPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format mobile: 09XX-XXX-XXX
  if (cleaned.length === 10 && cleaned.startsWith('09')) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  // Format landline: 0X-XXX-XXXX
  if (cleaned.length === 9 && cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5)}`;
  }
  
  return cleaned;
};

/**
 * Get WhatsApp URL for Ecuador phone number
 */
export const getWhatsAppUrl = (phone: string, message?: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to international format (593 is Ecuador's country code)
  let internationalPhone = '';
  if (cleaned.startsWith('09')) {
    // Mobile: remove leading 0 and add 593
    internationalPhone = `593${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('0')) {
    // Landline: remove leading 0 and add 593
    internationalPhone = `593${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('593')) {
    // Already in international format
    internationalPhone = cleaned;
  } else {
    // Assume it's a local number and add 593
    internationalPhone = `593${cleaned}`;
  }
  
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${internationalPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Get city by name
 */
export const getCityByName = (name: string) => {
  return ECUADOR_CITIES.find(city => 
    city.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Get cities by province
 */
export const getCitiesByProvince = (province: string) => {
  return ECUADOR_CITIES.filter(city => 
    city.province.toLowerCase() === province.toLowerCase()
  );
};

/**
 * Format currency for Ecuador (USD)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for Ecuador locale
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format time for Ecuador locale
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

/**
 * Get Ecuador timezone
 */
export const ECUADOR_TIMEZONE = 'America/Guayaquil';

/**
 * Convert date to Ecuador timezone
 */
export const toEcuadorTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString('en-US', { timeZone: ECUADOR_TIMEZONE }));
};