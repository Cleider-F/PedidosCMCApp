// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsF6D5l1dXR4rSR3axpFrD-idXh2ZaRUE",
  authDomain: "testeer-1516c.firebaseapp.com",
  projectId: "testeer-1516c",
  storageBucket: "testeer-1516c.firebasestorage.app",
  messagingSenderId: "1030430919430",
  appId: "1:1030430919430:web:22224089ad1c80f8a56c87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 OFFLINE ATIVADO AQUI
enableIndexedDbPersistence(db).catch(err => {
  console.warn("Offline não ativado:", err.code);
});

export { db };