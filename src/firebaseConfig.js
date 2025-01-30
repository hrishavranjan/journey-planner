import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvQAstFiF1BCMUQMc2pOw8KWV1XIk6Ha8",
  authDomain: "journey-planner-4a387.firebaseapp.com",
  projectId: "journey-planner-4a387",
  storageBucket: "journey-planner-4a387.appspot.com",
  messagingSenderId: "1045633903017",
  appId: "1:1045633903017:web:114fe48cb274ba1841fcb8",
  measurementId: "G-0PJM39RMH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
