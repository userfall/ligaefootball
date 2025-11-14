import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

/**
 * Mélange un tableau aléatoirement
 */
const shuffle = (array) =>
  array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

/**
 * Génère les matchs pour une journée
 * @param {number} journee - numéro de la journée
 * @param {string} date - date des matchs (format ISO)
 */
export const genererJourneeMatchs = async (journee, date) => {
  try {
    // Récupération des joueurs depuis Firestore
    const usersSnap = await getDocs(collection(db, "users"));
    const joueurs = usersSnap.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((u) => u.role === "joueur");

    if (joueurs.length < 2) {
      console.warn("Pas assez de joueurs pour générer une journée.");
      return;
    }

    // Récupération des matchs existants
    const matchsSnap = await getDocs(collection(db, "matches"));
    const matchs = matchsSnap.docs.map((doc) => doc.data());

    // Compteur de rencontres entre chaque paire
    const compteur = {};
    matchs.forEach((m) => {
      const [a, b] = m.joueurs.sort();
      const key = `${a}-${b}`;
      compteur[key] = (compteur[key] || 0) + 1;
    });

    // Mélange des joueurs
    const uids = shuffle(joueurs.map((j) => j.uid));
    const dejaChoisis = new Set();
    const matchsAJouer = [];

    for (let i = 0; i < uids.length; i++) {
      for (let j = i + 1; j < uids.length; j++) {
        const [a, b] = [uids[i], uids[j]];
        const key = `${a}-${b}`;
        if ((compteur[key] || 0) < 2 && !dejaChoisis.has(a) && !dejaChoisis.has(b)) {
          matchsAJouer.push([a, b]);
          dejaChoisis.add(a);
          dejaChoisis.add(b);
          break; // on passe au joueur suivant
        }
      }
    }

    // Enregistrement des matchs
    for (const [a, b] of matchsAJouer) {
      await addDoc(collection(db, "matches"), {
        joueurs: [a, b],
        date,
        score: null,
        journee
      });
    }

    console.log(`✅ Journée ${journee} générée avec ${matchsAJouer.length} matchs.`);
  } catch (error) {
    console.error("Erreur genererJourneeMatchs:", error);
  }
};