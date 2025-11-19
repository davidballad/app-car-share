import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app start
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      if (email === 'admin@ecuadorrideshare.com' && password === 'admin123') {
        const mockAdmin: Admin = {
          id: '1',
          email,
          name: 'Administrador',
          role: 'admin',
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store auth data
        localStorage.setItem('adminToken', 'mock-admin-token');
        localStorage.setItem('adminData', JSON.stringify(mockAdmin));
        
        setAdmin(mockAdmin);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  const value: AuthContextType = {
    admin,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;