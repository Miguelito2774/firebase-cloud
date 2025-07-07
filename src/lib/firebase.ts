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
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDasXmizMjRngnv3SffawPG-3rKDNJa-xE",
  authDomain: "mickyfirebase.firebaseapp.com",
  projectId: "mickyfirebase",
  storageBucket: "mickyfirebase.firebasestorage.app",
  messagingSenderId: "346525836307",
  appId: "1:346525836307:web:f10d96a9036705d4d50be6",
  measurementId: "G-SSRBR5ZB94"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "m1234");

let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { 
  auth,
  db,
  messaging,
  googleProvider, 
  facebookProvider,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
