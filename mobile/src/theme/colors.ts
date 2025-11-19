// Ecuador-themed color palette inspired by the flag and natural beauty
export const colors = {
  // Primary Ecuador colors (inspired by flag)
  primary: {
    blue: '#2E86AB',      // Deep Ecuador blue
    lightBlue: '#A23B72',  // Lighter blue variant
    darkBlue: '#1B5E7A',   // Darker blue for depth
  },
  
  // Secondary Ecuador colors (inspired by nature)
  secondary: {
    green: '#28a745',      // Vibrant Ecuador green
    lightGreen: '#6BCF7F', // Light green variant
    darkGreen: '#1E7E34',  // Dark green for contrast
  },
  
  // Yellow accent (from flag)
  accent: {
    yellow: '#FFD700',     // Ecuador flag yellow
    lightYellow: '#FFF3CD', // Light yellow for backgrounds
    darkYellow: '#E6C200',  // Darker yellow for text
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    gray: '#6C757D',
    darkGray: '#495057',
    black: '#212529',
  },
  
  // Status colors
  status: {
    success: '#28a745',    // Green for success
    warning: '#FFC107',    // Yellow for warnings
    error: '#DC3545',      // Red for errors
    info: '#17A2B8',       // Cyan for info
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD',
    inverse: '#FFFFFF',
    link: '#2E86AB',
  },
  
  // Border colors
  border: {
    light: '#DEE2E6',
    medium: '#CED4DA',
    dark: '#ADB5BD',
  },
  
  // WhatsApp green (for messaging)
  whatsapp: '#25D366',
  
  // Verification colors
  verification: {
    verified: '#28a745',
    pending: '#FFC107',
    rejected: '#DC3545',
    expired: '#6C757D',
  },
};

// Color aliases for easier usage
export const theme = {
  colors: {
    // Main brand colors
    primary: colors.primary.blue,
    primaryLight: colors.primary.lightBlue,
    primaryDark: colors.primary.darkBlue,
    
    secondary: colors.secondary.green,
    secondaryLight: colors.secondary.lightGreen,
    secondaryDark: colors.secondary.darkGreen,
    
    accent: colors.accent.yellow,
    
    // Common usage
    background: colors.background.primary,
    surface: colors.background.card,
    
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    textInverse: colors.text.inverse,
    
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.status.info,
    
    border: colors.border.light,
    
    // Special colors
    whatsapp: colors.whatsapp,
  },
};

export default colors;