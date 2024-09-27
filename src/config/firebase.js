import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDh40q2jBzqTBnTdEBSs0cg0IyYzYw7D34",
//   authDomain: "convo-f8ace.firebaseapp.com",
//   projectId: "convo-f8ace",
//   storageBucket: "convo-f8ace.appspot.com",
//   messagingSenderId: "169094038641",
//   appId: "1:169094038641:web:db0ca645cb33705eba47d0",
//   measurementId: "G-3160MJC9LS"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAVj1R9TO2Wm0YzA8whJ9H85D7NJWVz1Jg",
  authDomain: "convo-66ec5.firebaseapp.com",
  projectId: "convo-66ec5",
  storageBucket: "convo-66ec5.appspot.com",
  messagingSenderId: "813772511594",
  appId: "1:813772511594:web:4c4872aa2b8cd141972d13",
  measurementId: "G-GXYCY4D3HC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
