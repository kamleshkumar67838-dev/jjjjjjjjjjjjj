import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'payment'));
    console.log('🔥 Connected to Firebase Firestore successfully!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, falling back to local sync.');
    } else {
      console.log('Firebase connection initialized:', error);
    }
    return false;
  }
}
