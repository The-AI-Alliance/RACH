// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyA1EoEbOdvAjZ1vpljOFAPyiLvJHE6QolQ",
    authDomain: "rag-demo-fe-dsads.firebaseapp.com",
    projectId: "rag-demo-fe-dsads",
    storageBucket: "rag-demo-fe-dsads.firebasestorage.app",
    messagingSenderId: "655625681209",
    appId: "1:655625681209:web:a9bba861aed3d2e5c4d0e8"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, db, functions };
