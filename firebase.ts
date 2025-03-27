import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4vVaK3r-QiEdcL2a7PaLZIxOub795Ry4",
  authDomain: "lia-pdf.firebaseapp.com",
  projectId: "lia-pdf",
  storageBucket: "lia-pdf.appspot.com",
  messagingSenderId: "235398791352",
  appId: "1:235398791352:web:ba83aeaa6c3cf6267cf44d"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };