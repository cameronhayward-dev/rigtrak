import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, runTransaction } from "firebase/firestore";

// Same project as the original index.html build.
const firebaseConfig = {
  apiKey: "AIzaSyDb0lrLOMoO-E19fhpVilyfSOVg8kmDkp0",
  authDomain: "rigtrak-7380a.firebaseapp.com",
  projectId: "rigtrak-7380a",
  storageBucket: "rigtrak-7380a.firebasestorage.app",
  messagingSenderId: "824090444347",
  appId: "1:824090444347:web:837205427f7f97a43cd21e",
};

// Guard against re-init during Next.js Fast Refresh / double-mount.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const assetsCol = collection(db, "assets");
export const locationsCol = collection(db, "locations");
export const scansCol = collection(db, "scans");
export const inspectorsCol = collection(db, "inspectors");
export const checkoutsCol = collection(db, "checkouts");

export const counterRef = doc(db, "meta", "counter");
export const companyDocRef = doc(db, "meta", "company");

/** Reserves `n` sequential RigTrak IDs and returns the first one. */
export async function reserveRigTrakIds(n: number): Promise<number> {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const last = snap.exists() ? (snap.data().lastId as number) || 0 : 0;
    tx.set(counterRef, { lastId: last + n }, { merge: true });
    return last + 1;
  });
}

export function formatRigTrakId(n: number): string {
  return "RT-" + String(n).padStart(6, "0");
}
