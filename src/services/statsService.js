import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * Récupérer stats d’un joueur
 */
export const getStatsByUid = async (uid) => {
  const ref = doc(db, "stats", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      uid,
      matchs: 0,
      victoires: 0,
      buts: 0
    };
  }

  return snap.data();
};

/**
 * Initialiser stats
 */
export const initStats = async (uid) => {
  await setDoc(doc(db, "stats", uid), {
    uid,
    matchs: 0,
    victoires: 0,
    buts: 0
  });
};

/**
 * Incrémenter stats
 */
export const incrementStats = async (uid, { matchs = 0, victoires = 0, buts = 0 }) => {
  await updateDoc(doc(db, "stats", uid), {
    matchs: increment(matchs),
    victoires: increment(victoires),
    buts: increment(buts)
  });
};

/**
 * Remplacer stats
 */
export const updateStats = async (uid, data) => {
  await updateDoc(doc(db, "stats", uid), data);
};
