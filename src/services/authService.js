import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { auth, db } from "../firebase";

/**
 * Inscription utilisateur
 */
export const registerUser = async (email, password, pseudo) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    pseudo,
    role: "joueur",
    createdAt: Date.now()
  });

  return userCred.user;
};

/**
 * Connexion
 */
export const loginUser = async (email, password) => {
  const user = await signInWithEmailAndPassword(auth, email, password);
  return user.user;
};

/**
 * Déconnexion
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Récupérer les infos Firestore d’un user
 */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

/**
 * Observer un utilisateur connecté
 */
export const observeUser = (callback) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};

/**
 * Vérifier si c’est un admin
 */
export const isAdminFromProfile = async (uid) => {
  const user = await getUserProfile(uid);
  return user?.role === "admin";
};