import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "sahayak11-afca3",
  appId: "1:582067132824:web:df443880f540014462b3ed",
  storageBucket: "sahayak11-afca3.firebasestorage.app",
  apiKey: "AIzaSyBr_hVOVIViItS_NzfHG7fxwlMTWJbiBcA",
  authDomain: "sahayak11-afca3.firebaseapp.com",
  messagingSenderId: "582067132824",
  measurementId: "G-8DVW3KYPCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, signInWithPopup, signInAnonymously, signOut };

