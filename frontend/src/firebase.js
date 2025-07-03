import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfXL1kAjL9LLZf2dJqxUCL0WNrTlsiG1Y",
  authDomain: "testtagger-b785a.firebaseapp.com",
  projectId: "testtagger-b785a",
  storageBucket: "testtagger-b785a.appspot.com",
  messagingSenderId: "643769426524",
  appId: "1:643769426524:web:c40ca6f3d19c601c5c3c99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  
export default app;
