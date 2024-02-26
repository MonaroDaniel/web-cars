import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
const firebaseConfig = {
  apiKey: "AIzaSyAfraMAdI10NTouz3qBhx3ChKbJ8sKxNdk",
  authDomain: "webcars-d3f33.firebaseapp.com",
  projectId: "webcars-d3f33",
  storageBucket: "webcars-d3f33.appspot.com",
  messagingSenderId: "129490576625",
  appId: "1:129490576625:web:2102d2db4b4930b4923550"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }