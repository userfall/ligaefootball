import { db } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

/**
 * Calcule le classement complet.
 */
export const calculerClassement = async () => {
  try {
    const matchsSnap = await getDocs(collection(db, "matches"));
    const scores = {};

    matchsSnap.forEach((docSnap) => {
      const match = docSnap.data();
      if (!match) return;

      // ---------------------------
      // 1) Extraction des joueurs
      // ---------------------------
      let uid1, uid2;

      if (Array.isArray(match.joueurs) && match.joueurs.length >= 2) {
        [uid1, uid2] = match.joueurs;
      } else if (typeof match.joueurs === "object") {
        uid1 = match.joueurs.joueur1 || match.joueurs.home;
        uid2 = match.joueurs.joueur2 || match.joueurs.away;
      }

      if (!uid1 || !uid2) return; // impossible de traiter ce match

      // ---------------------------
      // 2) Extraction du score
      // ---------------------------
      let score1, score2;

      if (typeof match.score === "string" && match.score.includes("-")) {
        [score1, score2] = match.score.split("-").map(Number);
      } else {
        score1 = Number(match.score1 || match.buts1 || match.homeScore);
        score2 = Number(match.score2 || match.buts2 || match.awayScore);
      }

      if (isNaN(score1) || isNaN(score2)) return;

      // ---------------------------
      // Initialisation joueurs
      // ---------------------------
      const initPlayer = (uid) => {
        if (!scores[uid]) {
          scores[uid] = {
            uid,
            points: 0,
            matchs: 0,
            victoires: 0,
            nul: 0,
            defaites: 0,
            butsPour: 0,
            butsContre: 0,
          };
        }
      };

      initPlayer(uid1);
      initPlayer(uid2);

      // ---------------------------
      // Mise à jour stats
      // ---------------------------
      scores[uid1].matchs++;
      scores[uid2].matchs++;

      scores[uid1].butsPour += score1;
      scores[uid1].butsContre += score2;

      scores[uid2].butsPour += score2;
      scores[uid2].butsContre += score1;

      // Victoire / nul / défaite
      if (score1 > score2) {
        scores[uid1].points += 3;
        scores[uid1].victoires++;
        scores[uid2].defaites++;
      } else if (score1 < score2) {
        scores[uid2].points += 3;
        scores[uid2].victoires++;
        scores[uid1].defaites++;
      } else {
        scores[uid1].points++;
        scores[uid2].points++;
        scores[uid1].nul++;
        scores[uid2].nul++;
      }
    });

    // ---------------------------
    // Batch update standings
    // ---------------------------
    const batch = writeBatch(db);

    Object.values(scores).forEach((playerData) => {
      const ref = doc(db, "standings", playerData.uid);
      batch.set(ref, playerData);
    });

    await batch.commit();

    console.log("✅ Classement mis à jour !");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du calcul du classement :", error);
    return false;
  }
};

/**
 * Récupère le classement trié
 */
export const getClassement = async () => {
  try {
    const snapshot = await getDocs(collection(db, "standings"));
    const data = snapshot.docs.map((doc) => doc.data());

    // TRI amélioré
    data.sort((a, b) =>
      b.points - a.points || // 1) points
      (b.butsPour - b.butsContre) - (a.butsPour - a.butsContre) || // 2) diff
      b.butsPour - a.butsPour // 3) buts marqués
    );

    return data;
  } catch (error) {
    console.error("❌ Erreur récupération classement :", error);
    return [];
  }
};
