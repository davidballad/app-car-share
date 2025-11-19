import React, { createContext, useContext, ReactNode } from 'react';

// Ecuador-themed colors
const colors = {
  primary: {
    blue: '#2E86AB',
    lightBlue: '#A23B72',
    darkBlue: '#1B5E7A',
  },
  secondary: {
    green: '#28a745',
    lightGreen: '#6BCF7F',
    darkGreen: '#1E7E34',
  },
  accent: {
    yellow: '#FFD700',
    lightYellow: '#FFF3CD',
    darkYellow: '#E6C200',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    gray: '#6C757D',
    darkGray: '#495057',
    black: '#212529',
  },
  status: {
    success: '#28a745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
  },
  whatsapp: '#25D366',
};

const theme = {
  colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
};

interface ThemeContextType {
  theme: typeof theme;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value: ThemeContextType = {
    theme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;