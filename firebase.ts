
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID if provided
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Use localStorage-based persistence explicitly: the default auto-detection
// opens IndexedDB, which can hang indefinitely inside the iOS WKWebView
// (Capacitor), leaving auth calls stuck forever.
export const auth = initializeAuth(app, { persistence: browserLocalPersistence });

export default app;
