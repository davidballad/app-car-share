import React, { createContext, useContext, ReactNode } from 'react';
import { theme } from '../theme';

interface ThemeContextType {
  theme: typeof theme;
  colors: typeof theme.colors;
  typography: typeof theme.typography;
  spacing: typeof theme.spacing;
  borderRadius: typeof theme.borderRadius;
  shadows: typeof theme.shadows;
  components: typeof theme.components;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value: ThemeContextType = {
    theme,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    components: theme.components,
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