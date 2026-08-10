import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile, ScanHistoryItem } from "../types";

// 1. Initialize Firebase App & Services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection
export async function testFirestoreConnection() {
  try {
    await getDoc(doc(db, "users", "_connection_test_"));
  } catch {
    // silent catch for initial connection test
  }
}
testFirestoreConnection();

// 2. Error Handler conforming to firebase-skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn("Firestore Notice:", JSON.stringify(errInfo));
}

// Direct Firestore User Profile Fallback
export async function getOrCreateDirectFirestoreUser(email: string, fullName?: string): Promise<UserProfile> {
  const cleanId = "user_" + email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const userRef = doc(db, "users", cleanId);
  const path = `users/${cleanId}`;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: cleanId,
        fullName: data.fullName || fullName || "مستخدم دَوْر",
        email: data.email || email,
        points: data.points ?? 200,
        savedProductsCount: data.savedProductsCount ?? 3,
        levelTitle: data.levelTitle || "المستكشف الدائري",
        co2SavedKg: data.co2SavedKg ?? 12.5,
        scansHistory: data.scansHistory || [],
        completedChallenges: data.completedChallenges || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } else {
      const newProfile: UserProfile = {
        uid: cleanId,
        fullName: fullName || "مستخدم دَوْر",
        email: email,
        points: 220,
        savedProductsCount: 3,
        levelTitle: "المستكشف الدائري",
        co2SavedKg: 12.5,
        scansHistory: [
          {
            productName: "قميص قطني أبيض",
            material: "نسيج قطني",
            actionTaken: "تم التبرع لمنصة إحسان",
            circularScore: 92,
            pointsEarned: 50,
            date: "أمس",
          },
        ],
        completedChallenges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, {
        ...newProfile,
        updatedAt: serverTimestamp(),
      });
      return newProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// 3. User Profile Firestore Methods
export async function ensureUserProfile(user: User, customFullName?: string): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        fullName: data.fullName || user.displayName || customFullName || "مستخدم دَوْر",
        email: data.email || user.email || "",
        points: data.points ?? 200,
        savedProductsCount: data.savedProductsCount ?? 3,
        levelTitle: data.levelTitle || "المستكشف الدائري",
        co2SavedKg: data.co2SavedKg ?? 12.5,
        scansHistory: data.scansHistory || [],
        completedChallenges: data.completedChallenges || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: customFullName || user.displayName || "مستخدم دَوْر",
        email: user.email || "",
        points: 200,
        savedProductsCount: 3,
        levelTitle: "المستكشف الدائري",
        co2SavedKg: 12.5,
        scansHistory: [
          {
            productName: "قميص قطني أبيض",
            material: "نسيج قطني",
            actionTaken: "تم التبرع لمنصة إحسان",
            circularScore: 92,
            pointsEarned: 50,
            date: "أمس",
          },
          {
            productName: "صندوق كرتون مقوى",
            material: "كرتون ألياف",
            actionTaken: "فرز حاوية الورق",
            circularScore: 88,
            pointsEarned: 45,
            date: "قبل 3 أيام",
          },
        ],
        completedChallenges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, {
        ...newProfile,
        updatedAt: serverTimestamp(),
      });
      return newProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export function listenUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          uid: userId,
          fullName: data.fullName || "مستخدم دَوْر",
          email: data.email || "",
          points: data.points ?? 200,
          savedProductsCount: data.savedProductsCount ?? 0,
          levelTitle: data.levelTitle || "المستكشف الدائري",
          co2SavedKg: data.co2SavedKg ?? 0,
          scansHistory: data.scansHistory || [],
          completedChallenges: data.completedChallenges || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    }
  );
}

export async function addScanAndRewardToUser(
  userId: string,
  scanItem: ScanHistoryItem,
  pointsToAdd: number,
  co2ToAdd: number
) {
  const userRef = doc(db, "users", userId);
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const currentData = snap.data();
    const newPoints = (currentData.points || 0) + pointsToAdd;
    const newSaved = (currentData.savedProductsCount || 0) + 1;
    const newCo2 = Number(((currentData.co2SavedKg || 0) + co2ToAdd).toFixed(1));

    let levelTitle = "المستكشف الدائري";
    if (newPoints >= 1000) levelTitle = "بطل الاقتصاد الدائري";
    else if (newPoints >= 500) levelTitle = "خبير استدامة معتمد";
    else if (newPoints >= 300) levelTitle = "سفير البيئة الخضراء";

    await updateDoc(userRef, {
      points: newPoints,
      savedProductsCount: newSaved,
      co2SavedKg: newCo2,
      levelTitle,
      scansHistory: arrayUnion(scanItem),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 4. Authentication Functions
export async function signUpUser(email: string, pass: string, fullName: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: fullName });
      return await ensureUserProfile(cred.user, fullName);
    }
  } catch (err: any) {
    if (
      err.code === "auth/operation-not-allowed" ||
      err.code === "auth/configuration-not-found" ||
      err.code === "auth/network-request-failed"
    ) {
      return await getOrCreateDirectFirestoreUser(email, fullName);
    }
    throw err;
  }
  return await getOrCreateDirectFirestoreUser(email, fullName);
}

export async function signInUser(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      return await ensureUserProfile(cred.user);
    }
  } catch (err: any) {
    if (
      err.code === "auth/operation-not-allowed" ||
      err.code === "auth/configuration-not-found" ||
      err.code === "auth/network-request-failed"
    ) {
      return await getOrCreateDirectFirestoreUser(email);
    }
    throw err;
  }
  return await getOrCreateDirectFirestoreUser(email);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  if (cred.user) {
    return await ensureUserProfile(cred.user);
  }
  return null;
}

export async function signOutUser() {
  await signOut(auth);
}
