// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// TODO: create new database and hide these keys in env file
const firebaseConfig = {
  apiKey: "AIzaSyA78NnILyNefXjrlGeXffTYc2yL54zq3Pg",
  authDomain: "timesheet-826a7.firebaseapp.com",
  projectId: "timesheet-826a7",
  storageBucket: "timesheet-826a7.appspot.com",
  messagingSenderId: "56841872246",
  appId: "1:56841872246:web:afdd7a9fcfda46af3f1057"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);