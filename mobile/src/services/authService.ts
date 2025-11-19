import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInWithFacebook } from './firebase';

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'passenger' | 'driver';
  authProvider: 'email' | 'google' | 'facebook';
  socialProviderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Register with email/password
export const registerWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
): Promise<FirebaseUser> => {
  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`
  });

  // Create user document in Firestore
  const userData: UserData = {
    email,
    firstName,
    lastName,
    phone,
    role: 'passenger',
    authProvider: 'email',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return user;
};

// Login with email/password
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Login with Google
export const loginWithGoogleAuth = async (): Promise<FirebaseUser> => {
  const user = await signInWithGoogle();
  
  // Check if user document exists, create if not
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (!userDoc.exists()) {
    // Extract name from Google profile
    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData: UserData = {
      email: user.email || '',
      firstName,
      lastName,
      phone: user.phoneNumber || '',
      role: 'passenger',
      authProvider: 'google',
      socialProviderId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
  }

  return user;
};

// Login with Facebook
export const loginWithFacebookAuth = async (): Promise<FirebaseUser> => {
  const user = await signInWithFacebook();
  
  // Check if user document exists, create if not
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (!userDoc.exists()) {
    // Extract name from Facebook profile
    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData: UserData = {
      email: user.email || '',
      firstName,
      lastName,
      phone: user.phoneNumber || '',
      role: 'passenger',
      authProvider: 'facebook',
      socialProviderId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
  }

  return user;
};

// Logout
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Get user data from Firestore
export const getUserData = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};