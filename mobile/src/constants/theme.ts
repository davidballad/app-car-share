import { DefaultTheme } from 'react-native-paper';

// Ecuador-inspired color palette with vibrant blue and green
export const colors = {
  // Primary colors - Ecuador flag inspired
  primary: '#2E8B57', // Sea Green
  primaryDark: '#1F5F3F',
  primaryLight: '#4CAF50',
  
  // Secondary colors - Sky blue
  secondary: '#1E90FF', // Dodger Blue
  secondaryDark: '#1565C0',
  secondaryLight: '#42A5F5',
  
  // Accent colors
  accent: '#FFD700', // Gold
  accentLight: '#FFF176',
  
  // Neutral colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  
  // Text colors
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#212121',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Verification badge
  verified: '#4CAF50',
  unverified: '#FF9800',
  
  // Rating stars
  star: '#FFD700',
  starEmpty: '#E0E0E0',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    onBackground: colors.onBackground,
    outline: colors.border,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};