// =============================================
//  DoOr – Firebase Database Service
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
    apiKey: "AIzaSyCh--A5NzZ78ncc6MqZdIhUQe2HG1EW1aU",
    authDomain: "door-a3702.firebaseapp.com",
    projectId: "door-a3702",
    storageBucket: "door-a3702.firebasestorage.app",
    messagingSenderId: "176601799543",
    appId: "1:176601799543:web:3dba805a6a711202955f72"
  };


const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ─── Firestore Collection References ─────────
const USERS      = "users";
const BLOOD_BANK = "blood_bank";        // blood inventory per bank
const HOSPITALS  = "hospitals";         // hospital organ availability
const ORGAN_REQS = "organ_requests";    // pending organ requests
const BLOOD_REQS = "blood_requests";    // blood emergency requests
const MESSAGES   = "messages";          // encrypted chat messages

// =============================================
//  AUTH FUNCTIONS
// =============================================

/**
 * Register a new user with email/password.
 * Also writes their profile to Firestore.
 * @param {string} email
 * @param {string} password
 * @param {object} profile  – { name, bloodType, phone, willDonate }
 * @returns {Promise<UserCredential>}
 */
export async function registerUser(email, password, profile) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: profile.name });

  // Persist to Firestore
  await setDoc(doc(db, USERS, cred.user.uid), {
    uid:        cred.user.uid,
    name:       profile.name,
    email:      email,
    phone:      profile.phone || "",
    bloodType:  profile.bloodType,
    willDonate: profile.willDonate ?? true,
    isOrganDonor:         false,
    emergencyNotifications: true,
    location:   null,            // GeoPoint updated on login
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
    // Medical
    allergies:   "",
    conditions:  "",
    medications: "",
  });
  return cred;
}

/**
 * Sign in with email/password.
 * @returns {Promise<UserCredential>}
 */
export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Listen for auth state changes.
 * Calls callback(user) – user is null when signed out.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Returns the currently signed-in Firebase user (or null).
 */
export function currentAuthUser() {
  return auth.currentUser;
}

// =============================================
//  USER PROFILE FUNCTIONS
// =============================================

/**
 * Fetch a user's Firestore profile by UID.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update writable fields of the current user's profile.
 */
export async function updateUserProfile(uid, fields) {
  await updateDoc(doc(db, USERS, uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Persist the user's current GPS coordinates.
 */
export async function updateUserLocation(uid, lat, lng) {
  await updateDoc(doc(db, USERS, uid), {
    location:  new GeoPoint(lat, lng),
    updatedAt: serverTimestamp(),
  });
}

// =============================================
//  BLOOD BANK FUNCTIONS
// =============================================

/**
 * Fetch all blood bank inventory records.
 * Returns array of { id, bankName, city, address, lat, lng, inventory: {A+:0, ...}, phone, updatedAt }
 */
export async function getBloodBankInventory() {
  const snap = await getDocs(collection(db, BLOOD_BANK));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch blood bank records filtered by blood type availability > 0.
 */
export async function getAvailableBloodByType(bloodType) {
  const snap = await getDocs(collection(db, BLOOD_BANK));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(bank => bank.inventory && (bank.inventory[bloodType] ?? 0) > 0);
}

/**
 * Submit an emergency blood request.
 * @param {object} req – { requesterId, bloodType, urgency, message, lat, lng }
 */
export async function submitBloodRequest(req) {
  return addDoc(collection(db, BLOOD_REQS), {
    ...req,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

/**
 * Live-listen to incoming blood requests for this donor (blood type match).
 * Fires callback with array of pending requests.
 */
export function listenBloodRequests(bloodType, callback) {
  const q = query(
    collection(db, BLOOD_REQS),
    where("bloodType", "==", bloodType),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Accept / decline a blood request.
 */
export async function updateBloodRequest(reqId, status) {
  await updateDoc(doc(db, BLOOD_REQS, reqId), { status, updatedAt: serverTimestamp() });
}

// =============================================
//  HOSPITAL / ORGAN FUNCTIONS
// =============================================

/**
 * Fetch all hospitals with organ availability data.
 * Returns array of {
 *   id, name, city, address, lat, lng, phone, emergencyServices,
 *   beds, rating, organs: { Kidney: true, Liver: false, ... }
 * }
 */
export async function getHospitalsWithOrgans() {
  const snap = await getDocs(collection(db, HOSPITALS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch hospitals that have a specific organ available.
 */
export async function getHospitalsByOrgan(organType) {
  // Firestore doesn't support map-key queries directly;
  // fetch all and filter client-side (acceptable for small datasets).
  const all = await getHospitalsWithOrgans();
  return all.filter(h => h.organs && h.organs[organType] === true);
}

/**
 * Submit an organ request (hospital-grade).
 */
export async function submitOrganRequest(req) {
  return addDoc(collection(db, ORGAN_REQS), {
    ...req,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

/**
 * Listen for real-time organ requests (for hospital staff dashboards).
 */
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

/**
 * Update organ request status.
 */
export async function updateOrganRequest(reqId, status) {
  await updateDoc(doc(db, ORGAN_REQS, reqId), { status, updatedAt: serverTimestamp() });
}

// =============================================
//  MESSAGING FUNCTIONS
// =============================================

/**
 * Send an encrypted chat message.
 * roomId = sorted concat of two UIDs → "uid1_uid2"
 */
export async function sendMessage(roomId, senderId, text) {
  return addDoc(collection(db, MESSAGES, roomId, "msgs"), {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });
}

/**
 * Listen to a chat room in real time.
 */
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

// ─── Export the auth + db references too ─────
export { auth, db };

// =============================================
//  FIRESTORE SEED DATA STRUCTURE (Reference)
// =============================================
/*
  blood_bank/{bankId}
    bankName: "Apollo Blood Bank"
    city:     "Bengaluru"
    address:  "28, Greams Lane, Thousand Lights"
    lat:      12.9716
    lng:      77.5946
    phone:    "+91 44 28293333"
    updatedAt: Timestamp
    inventory:
      "A+":  24
      "A-":  8
      "B+":  18
      "B-":  5
      "AB+": 12
      "AB-": 3
      "O+":  30
      "O-":  9

  hospitals/{hospitalId}
    name:              "Fortis Hospital"
    city:              "Bengaluru"
    address:           "14, Cubbon Road"
    lat:               12.9762
    lng:               77.5929
    phone:             "+91 80 2222 2222"
    emergencyServices: true
    beds:              200
    rating:            4.5
    organs:
      Kidney:     true
      Liver:      false
      Heart:      true
      Lung:       false
      Pancreas:   true
      Cornea:     true
      "Bone Marrow": true
      Skin:       false

  users/{uid}
    name, email, phone, bloodType, willDonate, isOrganDonor,
    emergencyNotifications, location(GeoPoint), createdAt, updatedAt,
    allergies, conditions, medications

  blood_requests/{reqId}
    requesterId, bloodType, urgency, message, lat, lng, status, createdAt

  organ_requests/{reqId}
    requesterId, organType, bloodType, urgency, hospitalName,
    notes, lat, lng, status, createdAt

  messages/{roomId}/msgs/{msgId}
    senderId, text, timestamp
*/
