import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Only initialize if we have credentials (prevents build errors during setup)
const app = !getApps().length && process.env.FIREBASE_PRIVATE_KEY
    ? initializeApp({
        credential: cert(serviceAccount),
    })
    : (getApps().length ? getApp() : null);

// Export db and auth safely
const db = app ? getFirestore(app) : null as any;
const auth = app ? getAuth(app) : null as any;

export { db, auth };
