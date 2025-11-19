import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/services/firebase';

export default function App() {
  useEffect(() => {
    // Configure Google Sign-In on app start
    configureGoogleSignIn().catch(error => {
      console.error('Error configuring Google Sign-In:', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}