// rulesService.js
// Service pour récupérer les règles de la ligue

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

/**
 * Récupère le texte des règles depuis Firestore.
 * Si aucune règle n’est présente, retourne un texte par défaut.
 */
export const getRules = async () => {
  try {
    const snapshot = await getDocs(collection(db, "rules"));
    if (!snapshot.empty) {
      // On prend la première règle trouvée
      return snapshot.docs[0]?.data()?.text || "";
    }
    // Règles par défaut
    return `
      1. Chaque match compte pour le classement.
      2. Fair-play obligatoire.
      3. Respect des horaires des matchs.
      4. Les scores doivent être saisis correctement.
      5. Tout comportement abusif peut entraîner des sanctions.
    `;
  } catch (error) {
    console.error("Erreur getRules:", error);
    return "Impossible de récupérer les règles pour l’instant.";
  }
};
