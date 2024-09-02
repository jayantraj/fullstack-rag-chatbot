import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwNsqjwoE1VsGkTxL4yN-u3RBeO6OyH5M",
  authDomain: "jr-multi-pdf-chatbot.firebaseapp.com",
  projectId: "jr-multi-pdf-chatbot",
  storageBucket: "jr-multi-pdf-chatbot.appspot.com",
  messagingSenderId: "195195787108",
  appId: "1:195195787108:web:a838d0db020b4d9d9fcc71",
  measurementId: "G-G4Y5CBECVR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };
