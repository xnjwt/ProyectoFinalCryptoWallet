// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//La configuración que obtuviste de la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDx_opJK3OYN1asfNUr_A3JuvJ717ZDXb0",
  authDomain: "walletcrypto123-a7233.firebaseapp.com",
  projectId: "walletcrypto123-a7233",
  storageBucket: "walletcrypto123-a7233.firebasestorage.app",
  messagingSenderId: "1001765796374",
  appId: "1:1001765796374:web:2444d2a11231236e561337",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 3. Obtener la instancia de Auth (ESTO ES LO MÁS IMPORTANTE)
export const auth = getAuth(app);
