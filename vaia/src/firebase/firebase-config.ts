import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
	apiKey: "AIzaSyDNdQ2TBVDiLqUj1KgQtqj_A0MhYPP3eH8",
	authDomain: "vaia-form.firebaseapp.com",
	projectId: "vaia-form",
	storageBucket: "vaia-form.firebasestorage.app",
	messagingSenderId: "98495565720",
	appId: "1:98495565720:web:ba1f0e2799a149fc5a25ed",
	measurementId: "G-NMN2YNY1TC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// connectFunctionsEmulator(functions, "127.0.0.1", 5001);

export { app, db,  functions };