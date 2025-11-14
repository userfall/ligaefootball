import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { genererJourneeMatchs } from "../services/journeeService";
import { calculerClassement } from "../services/classementService";
import { getAllMatchs } from "../services/matchService";

function AdminDashboard() {
  const [joueurs, setJoueurs] = useState([]);
  const [matchs, setMatchs] = useState([]);
  const [joueur1, setJoueur1] = useState("");
  const [joueur2, setJoueur2] = useState("");
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const [matchId, setMatchId] = useState("");
  const [journee, setJournee] = useState(1);
  const [loading, setLoading] = useState(true);

  const enrichirMatchsAvecPseudos = (matchs, joueurs) => {
    return matchs.map((m) => {
      const noms = m.joueurs.map((uid) => {
        const joueur = joueurs.find((j) => j.uid === uid);
        return joueur ? joueur.pseudo : "Inconnu";
      });
      return { ...m, noms };
    });
  };

  const fetchJournee = async () => {
    try {
      const docRef = doc(db, "config", "journee");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setJournee(snap.data().numero);
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la journée :", err);
    }
  };

  const updateJournee = async (numero) => {
    try {
      await setDoc(doc(db, "config", "journee"), { numero });
      setJournee(numero);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la journée :", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const joueursData = usersSnap.docs.map((doc) => ({
        uid: doc.id,
        pseudo: doc.data().pseudo
      }));
      setJoueurs(joueursData);

      const matchsData = await getAllMatchs();
      const sortedMatchs = matchsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const enrichedMatchs = enrichirMatchsAvecPseudos(sortedMatchs, joueursData);
      setMatchs(enrichedMatchs);

      localStorage.setItem("role", "admin");
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournee();
    fetchData();
  }, []);

  const ajouterMatch = async () => {
    if (joueur1 === joueur2 || !joueur1 || !joueur2 || !date) {
      alert("Remplis tous les champs correctement.");
      return;
    }

    try {
      await addDoc(collection(db, "matches"), {
        joueurs: [joueur1, joueur2],
        date,
        score: null
      });

      alert("✅ Match ajouté !");
      setJoueur1("");
      setJoueur2("");
      setDate("");
      await fetchData();
    } catch (err) {
      console.error("Erreur lors de l'ajout du match :", err);
    }
  };

  const enregistrerScore = async () => {
    if (!matchId || !score) {
      alert("Sélectionne un match et entre un score.");
      return;
    }

    if (!/^\d+-\d+$/.test(score)) {
      alert("❌ Format de score invalide. Utilise le format 3-2.");
      return;
    }

    try {
      const matchRef = doc(db, "matches", matchId);
      await updateDoc(matchRef, { score });

      alert("✅ Score enregistré !");
      setMatchId("");
      setScore("");
      await fetchData();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du score :", err);
    }
  };

  const handleClassement = async () => {
    try {
      await calculerClassement();
      alert("✅ Classement mis à jour !");
    } catch (err) {
      console.error("Erreur lors du calcul du classement :", err);
    }
  };

  const handleGenererJournee = async () => {
    try {
      const date = new Date().toISOString().split("T")[0];
      await genererJourneeMatchs(journee, date);
      alert(`✅ Journée ${journee} générée !`);
      await updateJournee(journee + 1);
      await fetchData();
    } catch (err) {
      console.error("Erreur lors de la génération de la journée :", err);
    }
  };

  const handleResetSaison = async () => {
    if (!window.confirm("⚠️ Cette action va supprimer tous les matchs et réinitialiser la journée. Continuer ?")) return;

    try {
      const snap = await getDocs(collection(db, "matches"));
      const deletions = snap.docs.map((docSnap) => deleteDoc(doc(db, "matches", docSnap.id)));
      await Promise.all(deletions);

      await updateJournee(1);
      alert("✅ Saison réinitialisée !");
      await fetchData();
    } catch (err) {
      console.error("Erreur lors de la réinitialisation :", err);
    }
  };

  if (loading) {
    return <div>Chargement des données…</div>;
  }

  return (
    <div className="container">
      <h2>Dashboard Admin ⚙️</h2>

      <section className="card">
        <h3>📅 Générer une journée automatique</h3>
        <button onClick={handleGenererJournee}>
          Générer la journée {journee}
        </button>
      </section>

      <section className="card">
        <h3>➕ Ajouter un match manuel</h3>
        <select value={joueur1} onChange={(e) => setJoueur1(e.target.value)}>
          <option value="">Joueur 1</option>
          {joueurs.map((j) => (
            <option key={`j1-${j.uid}`} value={j.uid}>
              {j.pseudo}
            </option>
          ))}
        </select>
        <select value={joueur2} onChange={(e) => setJoueur2(e.target.value)}>
          <option value="">Joueur 2</option>
          {joueurs.map((j) => (
            <option key={`j2-${j.uid}`} value={j.uid}>
              {j.pseudo}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={ajouterMatch}>Ajouter</button>
      </section>

      <section className="card">
        <h3>✍️ Saisir un score</h3>
        <select value={matchId} onChange={(e) => setMatchId(e.target.value)}>
          <option value="">Sélectionne un match</option>
          {matchs.filter((m) => !m.score).map((m) => (
            <option key={`match-${m.id}`} value={m.id}>
              {m.date} — {m.noms.join(" vs ")}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Score (ex: 3-2)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <button onClick={enregistrerScore}>Enregistrer</button>
      </section>

      <section className="card">
        <h3>🔄 Recalculer le classement</h3>
        <button onClick={handleClassement}>Mettre à jour</button>
      </section>

      <section className="card">
        <h3>🧹 Réinitialiser la saison</h3>
        <button onClick={handleResetSaison}>
          Réinitialiser tous les matchs et la journée
        </button>
      </section>

      <section className="card">
        <h3>📊 Tous les matchs</h3>
        {matchs.length === 0 ? (
          <p>Aucun match trouvé.</p>
        ) : (
          matchs.map((m) => (
            <div key={`view-${m.id}`} className="match-card">
              <p>
                                <strong>{new Date(m.date).toLocaleDateString()}</strong> —{" "}
                {m.noms.join(" vs ")} :{" "}
                <strong>{m.score || "à venir"}</strong>{" "}
                {m.journee && <em>(Journée {m.journee})</em>}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;