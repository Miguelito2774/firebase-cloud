import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCjlpdK4G6TphXaNZM9XwrCaUImirWKkA",
  authDomain: "mi-app-b0862.firebaseapp.com",
  projectId: "mi-app-b0862",
  storageBucket: "mi-app-b0862.firebasestorage.app",
  messagingSenderId: "566888773016",
  appId: "1:566888773016:web:112c9385de75b6e5bb27ed",
  measurementId: "G-Y31HXGLX2Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { 
  auth,
  db,
  googleProvider, 
  facebookProvider,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
