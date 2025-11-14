import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * Envoyer une notification
 */
export const sendNotification = async (uid, message) => {
  await addDoc(collection(db, "notifications"), {
    uid,
    message,
    seen: false,
    date: Date.now()
  });
};

/**
 * Récupérer notifications d’un user
 */
export const getNotifications = async (uid) => {
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Marquer une notification comme vue
 */
export const markAsSeen = async (id) => {
  await updateDoc(doc(db, "notifications", id), { seen: true });
};

/**
 * Marquer toutes les notifications vues
 */
export const markAllSeen = async (uid) => {
  const list = await getNotifications(uid);

  const promises = list.map(item =>
    updateDoc(doc(db, "notifications", item.id), { seen: true })
  );

  await Promise.all(promises);
};
