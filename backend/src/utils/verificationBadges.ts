/**
 * Verification badge utilities for displaying user verification status
 */

export interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
}

export const VERIFICATION_BADGES: Record<string, VerificationBadge> = {
  phone_verified: {
    id: 'phone_verified',
    name: 'Teléfono Verificado',
    description: 'Número de teléfono confirmado',
    icon: 'phone-check',
    color: 'green',
    priority: 1
  },
  identity_verified: {
    id: 'identity_verified',
    name: 'Identidad Verificada',
    description: 'Documento de identidad confirmado',
    icon: 'id-card-check',
    color: 'blue',
    priority: 2
  },
  background_verified: {
    id: 'background_verified',
    name: 'Antecedentes Verificados',
    description: 'Verificación de antecedentes penales aprobada',
    icon: 'shield-check',
    color: 'purple',
    priority: 3
  },
  background_expired: {
    id: 'background_expired',
    name: 'Antecedentes Expirados',
    description: 'Verificación de antecedentes expirada - requiere renovación',
    icon: 'shield-exclamation',
    color: 'orange',
    priority: 3
  },
  driver_verified: {
    id: 'driver_verified',
    name: 'Conductor Verificado',
    description: 'Licencia de conducir confirmada',
    icon: 'car-check',
    color: 'indigo',
    priority: 4
  },
  vehicle_verified: {
    id: 'vehicle_verified',
    name: 'Vehículo Verificado',
    description: 'Documentos de vehículo confirmados',
    icon: 'truck-check',
    color: 'teal',
    priority: 5
  },
  fully_verified: {
    id: 'fully_verified',
    name: 'Completamente Verificado',
    description: 'Todas las verificaciones básicas completadas',
    icon: 'badge-check',
    color: 'gold',
    priority: 10
  },
  driver_ready: {
    id: 'driver_ready',
    name: 'Listo para Conducir',
    description: 'Todas las verificaciones de conductor completadas',
    icon: 'steering-wheel',
    color: 'emerald',
    priority: 11
  }
};

/**
 * Get verification badges for a user based on their verification status
 * @param verificationStatus - User's verification status
 * @returns Array of verification badges
 */
export function getUserVerificationBadges(verificationStatus: any): VerificationBadge[] {
  const badges: VerificationBadge[] = [];

  if (verificationStatus.phoneVerified) {
    badges.push(VERIFICATION_BADGES.phone_verified);
  }

  if (verificationStatus.identityVerified) {
    badges.push(VERIFICATION_BADGES.identity_verified);
  }

  if (verificationStatus.backgroundCheckPassed) {
    // Check if background check is not expired
    if (verificationStatus.backgroundCheckExpiryDate) {
      const expiryDate = new Date(verificationStatus.backgroundCheckExpiryDate);
      const now = new Date();
      if (now <= expiryDate) {
        badges.push(VERIFICATION_BADGES.background_verified);
      } else {
        badges.push(VERIFICATION_BADGES.background_expired);
      }
    } else {
      badges.push(VERIFICATION_BADGES.background_verified);
    }
  }

  if (verificationStatus.driverLicenseVerified) {
    badges.push(VERIFICATION_BADGES.driver_verified);
  }

  if (verificationStatus.vehicleRegistrationVerified) {
    badges.push(VERIFICATION_BADGES.vehicle_verified);
  }

  // Special badges
  const hasBasicVerifications = badges.some(b => b.id === 'phone_verified') &&
                               badges.some(b => b.id === 'identity_verified') &&
                               badges.some(b => b.id === 'background_verified');

  if (hasBasicVerifications) {
    badges.push(VERIFICATION_BADGES.fully_verified);
  }

  const hasDriverVerifications = badges.some(b => b.id === 'driver_verified') &&
                                badges.some(b => b.id === 'vehicle_verified');

  if (hasDriverVerifications) {
    badges.push(VERIFICATION_BADGES.driver_ready);
  }

  // Sort badges by priority
  return badges.sort((a, b) => b.priority - a.priority);
}

/**
 * Get verification progress percentage
 * @param verificationStatus - User's verification status
 * @param includeDriverVerifications - Whether to include driver-specific verifications
 * @returns Progress percentage (0-100)
 */
export function getVerificationProgress(
  verificationStatus: any, 
  includeDriverVerifications: boolean = false
): number {
  const basicSteps = [
    'phoneVerified',
    'identityVerified',
    'backgroundCheckPassed'
  ];

  const driverSteps = [
    'driverLicenseVerified',
    'vehicleRegistrationVerified'
  ];

  const steps = includeDriverVerifications ? [...basicSteps, ...driverSteps] : basicSteps;
  
  let completedSteps = 0;

  for (const step of steps) {
    if (step === 'backgroundCheckPassed') {
      // Check if background check is valid and not expired
      if (verificationStatus.backgroundCheckPassed) {
        if (verificationStatus.backgroundCheckExpiryDate) {
          const expiryDate = new Date(verificationStatus.backgroundCheckExpiryDate);
          const now = new Date();
          if (now <= expiryDate) {
            completedSteps++;
          }
        } else {
          completedSteps++;
        }
      }
    } else if (verificationStatus[step]) {
      completedSteps++;
    }
  }

  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Get next verification step for user
 * @param verificationStatus - User's verification status
 * @returns Next verification step or null if all completed
 */
export function getNextVerificationStep(verificationStatus: any): {
  step: string;
  title: string;
  description: string;
  action: string;
} | null {
  if (!verificationStatus.phoneVerified) {
    return {
      step: 'phone',
      title: 'Verificar Teléfono',
      description: 'Confirma tu número de teléfono con un código SMS',
      action: 'verify_phone'
    };
  }

  if (!verificationStatus.identityVerified) {
    return {
      step: 'identity',
      title: 'Verificar Identidad',
      description: 'Sube una foto de tu cédula o pasaporte',
      action: 'submit_identity'
    };
  }

  // Check if background check is valid and not expired
  const isBackgroundCheckValid = verificationStatus.backgroundCheckPassed && 
    (!verificationStatus.backgroundCheckExpiryDate || 
     new Date() <= new Date(verificationStatus.backgroundCheckExpiryDate));

  if (!isBackgroundCheckValid) {
    return {
      step: 'background',
      title: 'Verificación de Antecedentes',
      description: 'Completa la verificación de antecedentes penales',
      action: 'submit_background_check'
    };
  }

  // All basic verifications completed
  return null;
}

/**
 * Check if user can perform specific actions based on verification status
 * @param verificationStatus - User's verification status
 * @param action - Action to check
 * @returns Whether user can perform the action
 */
export function canPerformAction(verificationStatus: any, action: string): boolean {
  const requirements = {
    book_ride: ['phoneVerified', 'identityVerified', 'backgroundCheckPassed'],
    create_trip: ['phoneVerified', 'identityVerified', 'backgroundCheckPassed', 'driverLicenseVerified', 'vehicleRegistrationVerified'],
    send_message: ['phoneVerified'],
    leave_review: ['phoneVerified', 'identityVerified']
  };

  const required = requirements[action as keyof typeof requirements];
  if (!required) return false;

  for (const requirement of required) {
    if (requirement === 'backgroundCheckPassed') {
      // Check if background check is valid and not expired
      if (!verificationStatus.backgroundCheckPassed) return false;
      if (verificationStatus.backgroundCheckExpiryDate) {
        const expiryDate = new Date(verificationStatus.backgroundCheckExpiryDate);
        const now = new Date();
        if (now > expiryDate) return false;
      }
    } else if (!verificationStatus[requirement]) {
      return false;
    }
  }

  return true;
}

/**
 * Get verification status summary for display
 * @param verificationStatus - User's verification status
 * @returns Verification summary
 */
export function getVerificationSummary(verificationStatus: any): {
  level: 'none' | 'basic' | 'full' | 'driver';
  badges: VerificationBadge[];
  progress: number;
  nextStep: ReturnType<typeof getNextVerificationStep>;
  canBookRides: boolean;
  canCreateTrips: boolean;
} {
  const badges = getUserVerificationBadges(verificationStatus);
  const progress = getVerificationProgress(verificationStatus);
  const driverProgress = getVerificationProgress(verificationStatus, true);
  const nextStep = getNextVerificationStep(verificationStatus);

  let level: 'none' | 'basic' | 'full' | 'driver' = 'none';
  
  if (progress === 100) {
    if (driverProgress === 100) {
      level = 'driver';
    } else {
      level = 'full';
    }
  } else if (progress > 0) {
    level = 'basic';
  }

  return {
    level,
    badges,
    progress,
    nextStep,
    canBookRides: canPerformAction(verificationStatus, 'book_ride'),
    canCreateTrips: canPerformAction(verificationStatus, 'create_trip')
  };
}