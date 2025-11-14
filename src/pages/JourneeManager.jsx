import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { genererJourneeMatchs } from "../services/journeeService";
import { getAllMatchs } from "../services/matchService";

function JourneeManager() {
  const [journee, setJournee] = useState(1);
  const [matchs, setMatchs] = useState([]);

  // 🔁 Charger la journée depuis Firestore
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

  // 🔁 Enregistrer la nouvelle journée dans Firestore
  const updateJournee = async (nouveauNumero) => {
    try {
      await setDoc(doc(db, "config", "journee"), { numero: nouveauNumero });
      setJournee(nouveauNumero);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la journée :", err);
    }
  };

  // 🔁 Charger les matchs
  const fetchMatchs = async () => {
    try {
      const data = await getAllMatchs();
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMatchs(sorted);
    } catch (err) {
      console.error("Erreur lors du chargement des matchs :", err);
    }
  };

  useEffect(() => {
    fetchJournee();
    fetchMatchs();
  }, []);

  // ➕ Générer une nouvelle journée
  const handleGenererJournee = async () => {
    try {
      const date = new Date().toISOString().split("T")[0];
      await genererJourneeMatchs(journee, date);
      alert(`✅ Journée ${journee} générée !`);
      await updateJournee(journee + 1);
      fetchMatchs();
    } catch (err) {
      console.error("Erreur lors de la génération de la journée :", err);
    }
  };

  return (
    <div className="container">
      <h2>Gestion des Journées ⚙️</h2>

      <section className="card">
        <h3>📅 Générer une journée automatique</h3>
        <button onClick={handleGenererJournee}>
          Générer la journée {journee}
        </button>
      </section>

      <section className="card">
        <h3>📊 Tous les matchs existants</h3>
        {matchs.length === 0 ? (
          <p>Aucun match enregistré.</p>
        ) : (
          matchs.map((m, i) => (
            <p key={i}>
              <strong>{new Date(m.date).toLocaleDateString()}</strong> —{" "}
              {m.joueurs?.join(" vs ")} :{" "}
              <strong>{m.score || "à venir"}</strong>{" "}
              {m.journee && <em>(Journée {m.journee})</em>}
            </p>
          ))
        )}
      </section>
    </div>
  );
}

export default JourneeManager;