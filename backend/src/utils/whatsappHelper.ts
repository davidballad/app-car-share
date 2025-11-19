/**
 * WhatsApp integration utilities for Ecuador rideshare
 */

/**
 * Generate WhatsApp URL for opening chat with a phone number
 */
export function generateWhatsAppURL(phoneNumber: string, message?: string): string {
  // Remove any non-digit characters and ensure Ecuador format
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Add Ecuador country code if not present
  let formattedPhone = cleanPhone;
  if (!cleanPhone.startsWith('593')) {
    // Remove leading 0 if present and add Ecuador country code
    formattedPhone = '593' + cleanPhone.replace(/^0/, '');
  }

  // Base WhatsApp URL
  let whatsappURL = `https://wa.me/${formattedPhone}`;

  // Add pre-filled message if provided
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    whatsappURL += `?text=${encodedMessage}`;
  }

  return whatsappURL;
}

/**
 * Generate default messages for different scenarios
 */
export const WhatsAppMessages = {
  /**
   * Message for passenger contacting driver
   */
  passengerToDriver: (tripDetails: {
    originCity: string;
    destinationCity: string;
    departureDate: string;
    departureTime: string;
  }) => {
    return `Hola! Soy pasajero de tu viaje ${tripDetails.originCity} → ${tripDetails.destinationCity} el ${tripDetails.departureDate} a las ${tripDetails.departureTime}. ¿Podrías confirmar los detalles del punto de encuentro?`;
  },

  /**
   * Message for driver contacting passenger
   */
  driverToPassenger: (tripDetails: {
    originCity: string;
    destinationCity: string;
    departureDate: string;
    departureTime: string;
  }) => {
    return `Hola! Soy el conductor del viaje ${tripDetails.originCity} → ${tripDetails.destinationCity} el ${tripDetails.departureDate} a las ${tripDetails.departureTime}. Te contacto para coordinar los detalles del viaje.`;
  },

  /**
   * Generic contact message
   */
  generic: () => {
    return `Hola! Te contacto desde la app de CarConnect Ecuador.`;
  }
};

/**
 * Validate Ecuador phone number format
 */
export function isValidEcuadorPhone(phoneNumber: string): boolean {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Ecuador mobile numbers: 09XXXXXXXX (10 digits) or 5939XXXXXXXX (12 digits with country code)
  // Ecuador landline numbers: 0XXXXXXXX (9 digits) or 593XXXXXXXX (11 digits with country code)
  
  if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
    return true; // Mobile number
  }
  
  if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
    return true; // Landline number
  }
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('5939')) {
    return true; // Mobile with country code
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('593') && !cleanPhone.startsWith('5939')) {
    return true; // Landline with country code
  }
  
  return false;
}

/**
 * Format Ecuador phone number for display
 */
export function formatEcuadorPhone(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
    // Format: 09XX-XXX-XXXX
    return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }
  
  if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
    // Format: 0X-XXX-XXXX
    return `${cleanPhone.slice(0, 2)}-${cleanPhone.slice(2, 5)}-${cleanPhone.slice(5)}`;
  }
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('5939')) {
    // Format: +593 9XX-XXX-XXXX
    return `+593 ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 9)}-${cleanPhone.slice(9)}`;
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('593')) {
    // Format: +593 X-XXX-XXXX
    return `+593 ${cleanPhone.slice(3, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }
  
  return phoneNumber; // Return original if no format matches
}