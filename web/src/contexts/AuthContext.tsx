import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'passenger' | 'driver' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app start
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'Usuario',
        lastName: 'Demo',
        phone: '0987654321',
        role: 'passenger',
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth data
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: 'passenger',
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth data
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (error) {
      throw new Error('Error al crear la cuenta');
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { loginWithGoogleAuth, getUserData } = await import('../services/authService');
      const firebaseUser = await loginWithGoogleAuth();
      
      // Get user data from Firestore
      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: 'passenger',
        };
        
        // Store auth data
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    try {
      const { loginWithFacebookAuth, getUserData } = await import('../services/authService');
      const firebaseUser = await loginWithFacebookAuth();
      
      // Get user data from Firestore
      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: 'passenger',
        };
        
        // Store auth data
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setUser(user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
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