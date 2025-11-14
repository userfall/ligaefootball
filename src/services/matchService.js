import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Récupère tous les matchs pour un utilisateur spécifique
export const getUserMatchs = async (uid) => {
  const q = query(collection(db, "matches"), where("joueurs", "array-contains", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Récupère tous les matchs de la ligue (Admin)
export const getAllMatchs = async () => {
  const snapshot = await getDocs(collection(db, "matches"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
