// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsEpkXulP3bOs2QVs2Mz3ABDiLbl5WqaM",
  authDomain: "sigma-lyceum-321504.firebaseapp.com",
  projectId: "sigma-lyceum-321504",
  storageBucket: "sigma-lyceum-321504.firebasestorage.app",
  messagingSenderId: "390719125148",
  appId: "1:390719125148:web:4b20c685a5b0cbdb8a5f59",
  measurementId: "G-8RM9WP0ZN6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
