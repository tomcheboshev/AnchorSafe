// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnT9kWhZ2veYj3dWgV0ao33uLH1zuvLFc",
  authDomain: "anchorsafe-fb701.firebaseapp.com",
  projectId: "anchorsafe-fb701",
  storageBucket: "anchorsafe-fb701.firebasestorage.app",
  messagingSenderId: "762553859812",
  appId: "1:762553859812:web:b38babb22f3d9fd12776f1",
  measurementId: "G-W2QXR7JKF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);