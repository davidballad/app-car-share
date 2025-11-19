import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, accessToken } = data.data;
        setUser(user);
        setToken(accessToken);
        
        await AsyncStorage.setItem('token', accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error(data.error?.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        const { user, accessToken } = data.data;
        setUser(user);
        setToken(accessToken);
        
        await AsyncStorage.setItem('token', accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error(data.error?.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { loginWithGoogleAuth } = await import('../services/authService');
      const firebaseUser = await loginWithGoogleAuth();
      
      // Get user data from Firestore
      const { getUserData } = await import('../services/authService');
      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        };
        
        setUser(user);
        // For Firebase auth, we use the Firebase token
        const token = await firebaseUser.getIdToken();
        setToken(token);
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const { loginWithFacebookAuth } = await import('../services/authService');
      const firebaseUser = await loginWithFacebookAuth();
      
      // Get user data from Firestore
      const { getUserData } = await import('../services/authService');
      const userData = await getUserData(firebaseUser.uid);
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        };
        
        setUser(user);
        // For Firebase auth, we use the Firebase token
        const token = await firebaseUser.getIdToken();
        setToken(token);
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};