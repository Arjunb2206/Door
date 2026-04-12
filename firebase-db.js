// =============================================
//  DoOr – Firebase Database Service
//  Project: door-a3702
//  Domain:  https://arjunb2206.github.io/Door
//  All Firestore & Auth operations live here.
//  Import this script in every page that needs DB access.
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  GeoPoint,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Firebase Config ──────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCh--A5NzZ78ncc6MqZdIhUQe2HG1EW1aU",
  authDomain:        "door-a3702.firebaseapp.com",
  databaseURL:       "https://door-a3702-default-rtdb.firebaseio.com",
  projectId:         "door-a3702",
  storageBucket:     "door-a3702.firebasestorage.app",
  messagingSenderId: "176601799543",
  appId:             "1:176601799543:web:6457512910305a51955f72",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ─── Firestore Collection References ─────────
const USERS      = "users";
const BLOOD_BANK = "blood_bank";
const HOSPITALS  = "hospitals";
const ORGAN_REQS = "organ_requests";
const BLOOD_REQS = "blood_requests";
const MESSAGES   = "messages";

// =============================================
//  AUTH FUNCTIONS
// =============================================

export async function registerUser(email, password, profile) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: profile.name });
  await setDoc(doc(db, USERS, cred.user.uid), {
    uid:                    cred.user.uid,
    name:                   profile.name,
    email:                  email,
    phone:                  profile.phone  || "",
    bloodType:              profile.bloodType || "",     // e.g. "O+", "B-"
    willDonate:             profile.willDonate === true, // always strict boolean
    isOrganDonor:           false,
    emergencyNotifications: true,
    city:                   profile.city || "Bengaluru",
    location:               null,
    createdAt:              serverTimestamp(),
    updatedAt:              serverTimestamp(),
    allergies:              "",
    conditions:             "",
    medications:            "",
  });
  return cred;
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentAuthUser() {
  return auth.currentUser;
}

// =============================================
//  USER PROFILE FUNCTIONS
// =============================================

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, fields) {
  await updateDoc(doc(db, USERS, uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserLocation(uid, lat, lng) {
  await updateDoc(doc(db, USERS, uid), {
    location:  new GeoPoint(lat, lng),
    updatedAt: serverTimestamp(),
  });
}

// =============================================
//  BLOOD BANK FUNCTIONS
// =============================================

export async function getBloodBankInventory() {
  const snap = await getDocs(collection(db, BLOOD_BANK));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAvailableBloodByType(bloodType) {
  const snap = await getDocs(collection(db, BLOOD_BANK));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(bank => bank.inventory && (bank.inventory[bloodType] ?? 0) > 0);
}

export async function submitBloodRequest(req) {
  return addDoc(collection(db, BLOOD_REQS), {
    ...req,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

export function listenBloodRequests(bloodType, callback) {
  const q = query(
    collection(db, BLOOD_REQS),
    where("bloodType", "==", bloodType),
    where("status",    "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function updateBloodRequest(reqId, status) {
  await updateDoc(doc(db, BLOOD_REQS, reqId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// =============================================
//  HOSPITAL / ORGAN FUNCTIONS
// =============================================

export async function getHospitalsWithOrgans() {
  const snap = await getDocs(collection(db, HOSPITALS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getHospitalsByOrgan(organType) {
  const all = await getHospitalsWithOrgans();
  return all.filter(h => h.organs && h.organs[organType] === true);
}

export async function submitOrganRequest(req) {
  return addDoc(collection(db, ORGAN_REQS), {
    ...req,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

export function listenOrganRequests(callback) {
  const q = query(
    collection(db, ORGAN_REQS),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function updateOrganRequest(reqId, status) {
  await updateDoc(doc(db, ORGAN_REQS, reqId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// =============================================
//  MESSAGING FUNCTIONS
// =============================================

export async function sendMessage(roomId, senderId, text) {
  return addDoc(collection(db, MESSAGES, roomId, "msgs"), {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });
}

export function listenMessages(roomId, callback) {
  const q = query(
    collection(db, MESSAGES, roomId, "msgs"),
    orderBy("timestamp", "asc"),
    limit(100)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─── Export raw auth + db for advanced use ───
export { auth, db };
