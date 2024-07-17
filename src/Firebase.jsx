import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
 
const firebaseConfig = {
    apiKey: "AIzaSyCeM4j61KY8dRrlcLWv-K-iGyvs6T81bcc",
    authDomain: "imps-4909a.firebaseapp.com",
    projectId: "imps-4909a",
    storageBucket: "imps-4909a.appspot.com",
    messagingSenderId: "358415281371",
    appId: "1:358415281371:web:57c4059389fc66966bf0fe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth, db, storage };