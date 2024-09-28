import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyC2pPtKqBoEQorfY5E1oQhVc-oxrBE7vVM",
//   authDomain: "convo-d67f0.firebaseapp.com",
//   projectId: "convo-d67f0",
//   storageBucket: "convo-d67f0.appspot.com",
//   messagingSenderId: "933162631687",
//   appId: "1:933162631687:web:585753392024fb698f60a2",
//   measurementId: "G-XBYSD7GW8B",
// };

const firebaseConfig = {
  apiKey: "AIzaSyBokovOj0nN5DmUY4atWhSkK1P1m4Rm8P4",
  authDomain: "convo-1-1f2f7.firebaseapp.com",
  projectId: "convo-1-1f2f7",
  storageBucket: "convo-1-1f2f7.appspot.com",
  messagingSenderId: "454824922776",
  appId: "1:454824922776:web:c2deed7278a8ebc3168aed",
  measurementId: "G-W3TBGJW2DC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
