import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuration
// Replace with your Firebase project config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

// Social auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  display: 'popup'
});

/**
 * Sign in with Google for React Native
 * Uses @react-native-google-signin/google-signin package
 * @returns Firebase user
 */
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation (for testing in browser)
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }

    // React Native implementation
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    
    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user info from Google
    const { idToken } = await GoogleSignin.signIn();
    
    // Create Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase
    const result = await signInWithCredential(auth, googleCredential);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials.');
    }
    
    throw error;
  }
};

/**
 * Sign in with Facebook for React Native
 * Uses react-native-fbsdk-next package
 * @returns Firebase user
 */
export const signInWithFacebook = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation (for testing in browser)
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, facebookProvider);
      return result.user;
    }

    // React Native implementation
    const { LoginManager, AccessToken } = await import('react-native-fbsdk-next');
    
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    
    if (result.isCancelled) {
      throw new Error('User cancelled the login process');
    }
    
    // Get the access token
    const data = await AccessToken.getCurrentAccessToken();
    
    if (!data) {
      throw new Error('Something went wrong obtaining access token');
    }
    
    // Create Firebase credential
    const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
    
    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, facebookCredential);
    return userCredential.user;
  } catch (error: any) {
    console.error('Facebook sign-in error:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials.');
    }
    
    throw error;
  }
};

/**
 * Configure Google Sign-In
 * Call this during app initialization
 */
export const configureGoogleSignIn = async () => {
  if (Platform.OS !== 'web') {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // From Firebase Console
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }
};
