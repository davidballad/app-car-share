import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
const USERS = 'users';
const TRIPS = 'trips';
const BOOKINGS = 'bookings';
const VERIFICATIONS = 'verifications';
const NOTIFICATIONS = 'notifications';

// User operations
export const createUser = async (userId: string, userData: any) => {
  await updateDoc(doc(db, USERS, userId), {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getUser = async (userId: string) => {
  const userDoc = await getDoc(doc(db, USERS, userId));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

export const updateUser = async (userId: string, userData: any) => {
  await updateDoc(doc(db, USERS, userId), {
    ...userData,
    updatedAt: Timestamp.now(),
  });
};

// Trip operations
export const searchTrips = async (fromCity: string, toCity: string, date: string) => {
  const tripsRef = collection(db, TRIPS);
  const q = query(
    tripsRef,
    where('fromCity', '==', fromCity),
    where('toCity', '==', toCity),
    where('departureDate', '>=', date),
    where('status', '==', 'active'),
    orderBy('departureDate', 'asc'),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTrip = async (tripData: any) => {
  const docRef = await addDoc(collection(db, TRIPS), {
    ...tripData,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getTrip = async (tripId: string) => {
  const tripDoc = await getDoc(doc(db, TRIPS, tripId));
  return tripDoc.exists() ? { id: tripDoc.id, ...tripDoc.data() } : null;
};

export const updateTrip = async (tripId: string, tripData: any) => {
  await updateDoc(doc(db, TRIPS, tripId), {
    ...tripData,
    updatedAt: Timestamp.now(),
  });
};

export const deleteTrip = async (tripId: string) => {
  await deleteDoc(doc(db, TRIPS, tripId));
};

// Booking operations
export const createBooking = async (bookingData: any) => {
  const docRef = await addDoc(collection(db, BOOKINGS), {
    ...bookingData,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserBookings = async (userId: string) => {
  const bookingsRef = collection(db, BOOKINGS);
  const q = query(
    bookingsRef,
    where('passengerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDriverBookings = async (driverId: string) => {
  const bookingsRef = collection(db, BOOKINGS);
  const q = query(
    bookingsRef,
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBooking = async (bookingId: string, bookingData: any) => {
  await updateDoc(doc(db, BOOKINGS, bookingId), {
    ...bookingData,
    updatedAt: Timestamp.now(),
  });
};

// Verification operations
export const submitVerification = async (verificationData: any) => {
  const docRef = await addDoc(collection(db, VERIFICATIONS), {
    ...verificationData,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserVerification = async (userId: string) => {
  const verificationsRef = collection(db, VERIFICATIONS);
  const q = query(
    verificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// Notification operations
export const getUserNotifications = async (userId: string) => {
  const notificationsRef = collection(db, NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, NOTIFICATIONS, notificationId), {
    read: true,
    readAt: Timestamp.now(),
  });
};