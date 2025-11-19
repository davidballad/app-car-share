import axios from 'axios';

export interface SmsVerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

export interface SmsVerificationCheck {
  success: boolean;
  isValid: boolean;
  error?: string;
}

export class SmsService {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioVerifyServiceSid: string;

  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioVerifyServiceSid) {
      console.warn('Twilio credentials not configured. SMS verification will be mocked.');
    }
  }

  /**
   * Send SMS verification code to phone number
   * @param phoneNumber - Phone number in E.164 format (+593XXXXXXXXX)
   * @returns Verification result
   */
  async sendVerificationCode(phoneNumber: string): Promise<SmsVerificationResult> {
    try {
      // If Twilio is not configured, return mock success for development
      if (!this.isConfigured()) {
        console.log(`[MOCK SMS] Verification code sent to ${phoneNumber}: 123456`);
        return {
          success: true,
          verificationId: 'mock-verification-id'
        };
      }

      const response = await axios.post(
        `https://verify.twilio.com/v2/Services/${this.twilioVerifyServiceSid}/Verifications`,
        {
          To: phoneNumber,
          Channel: 'sms'
        },
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        verificationId: response.data.sid
      };
    } catch (error: any) {
      console.error('SMS verification error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: 'Error al enviar código de verificación. Intenta nuevamente.'
      };
    }
  }

  /**
   * Verify SMS code
   * @param phoneNumber - Phone number in E.164 format
   * @param code - Verification code entered by user
   * @returns Verification check result
   */
  async verifyCode(phoneNumber: string, code: string): Promise<SmsVerificationCheck> {
    try {
      // If Twilio is not configured, accept mock code for development
      if (!this.isConfigured()) {
        const isValid = code === '123456';
        console.log(`[MOCK SMS] Verification check for ${phoneNumber} with code ${code}: ${isValid ? 'VALID' : 'INVALID'}`);
        
        return {
          success: true,
          isValid
        };
      }

      const response = await axios.post(
        `https://verify.twilio.com/v2/Services/${this.twilioVerifyServiceSid}/VerificationCheck`,
        {
          To: phoneNumber,
          Code: code
        },
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const isValid = response.data.status === 'approved';

      return {
        success: true,
        isValid
      };
    } catch (error: any) {
      console.error('SMS verification check error:', error.response?.data || error.message);
      
      // If it's a Twilio error about invalid code, return that info
      if (error.response?.status === 404) {
        return {
          success: true,
          isValid: false
        };
      }

      return {
        success: false,
        isValid: false,
        error: 'Error al verificar código. Intenta nuevamente.'
      };
    }
  }

  /**
   * Check if Twilio is properly configured
   * @returns True if all required credentials are present
   */
  private isConfigured(): boolean {
    return !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioVerifyServiceSid);
  }

  /**
   * Format phone number for SMS (ensure E.164 format)
   * @param phone - Phone number to format
   * @returns Formatted phone number
   */
  static formatPhoneForSms(phone: string): string {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // If it already starts with +593, return as is
    if (cleanPhone.startsWith('+593')) {
      return cleanPhone;
    }
    
    // If it starts with 593, add +
    if (cleanPhone.startsWith('593')) {
      return '+' + cleanPhone;
    }
    
    // If it starts with 0, replace with +593
    if (cleanPhone.startsWith('0')) {
      return '+593' + cleanPhone.substring(1);
    }
    
    // Otherwise, assume it's a local number and add +593
    return '+593' + cleanPhone;
  }
}