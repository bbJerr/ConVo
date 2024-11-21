import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDh40q2jBzqTBnTdEBSs0cg0IyYzYw7D34",
  authDomain: "convo-f8ace.firebaseapp.com",
  projectId: "convo-f8ace",
  storageBucket: "convo-f8ace.appspot.com",
  messagingSenderId: "169094038641",
  appId: "1:169094038641:web:db0ca645cb33705eba47d0",
  measurementId: "G-3160MJC9LS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
