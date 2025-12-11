import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCLQYTjCGIlss9GAk5XhKdXnyAF-MiHI38",
    authDomain: "tasking-calendar-seo.firebaseapp.com",
    projectId: "tasking-calendar-seo",
    storageBucket: "tasking-calendar-seo.firebasestorage.app",
    messagingSenderId: "230987845056",
    appId: "1:230987845056:web:c4c65f94eb6b3e47f74c25",
    measurementId: "G-PQ12GMBYFF"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

export { app, auth, db, googleProvider };
