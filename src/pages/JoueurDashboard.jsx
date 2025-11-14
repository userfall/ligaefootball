import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getUserMatchs } from "../services/matchService";
import { getStatsByUid } from "../services/statsService";
import { getRules } from "../services/rulesService";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

function JoueurDashboard() {
  const [matchs, setMatchs] = useState([]);
  const [stats, setStats] = useState({});
  const [rules, setRules] = useState("");
  const [joueursMap, setJoueursMap] = useState({});
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      localStorage.setItem("role", "joueur");
      setLoading(true);

      try {
        const [matchsData, statsData, rulesText, usersSnap] = await Promise.all([
          getUserMatchs(user.uid),
          getStatsByUid(user.uid),
          getRules(),
          getDocs(collection(db, "users"))
        ]);

        const joueurs = {};
        usersSnap.docs.forEach((doc) => {
          joueurs[doc.id] = doc.data().pseudo || "Inconnu";
        });
        setJoueursMap(joueurs);

        const sortedMatchs = matchsData.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setMatchs(sortedMatchs.slice(0, 5));
        setStats(statsData);
        setRules(rulesText);
        localStorage.setItem("pseudo", joueurs[user.uid] || "");
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Chargement des données… ⏳</div>;
  }

  const totalMatchs = stats.matchs ?? (stats.victoires ?? 0) + (stats.defaites ?? 0) + (stats.nul ?? 0);
  const winRate = totalMatchs > 0 ? Math.round((stats.victoires / totalMatchs) * 100) : 0;
  const goalAverage = (stats.butsPour ?? 0) - (stats.butsContre ?? 0);
  const efficacite = totalMatchs > 0 ? (stats.points / totalMatchs).toFixed(2) : "0.00";
  const pseudoAffiche = joueursMap[user.uid]?.trim() || "Pseudo non défini";

  return (
    <div className="container" style={{ padding: "1rem" }}>
      <h2>Bienvenue dans Mini-Liga ⚽</h2>
      <p>Connecté en tant que : <strong>{user?.email}</strong></p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <Link to="/"><button>🏠 Accueil</button></Link>
        <Link to="/classement"><button>🏆 Classement</button></Link>
        <button onClick={() => {
          signOut(auth);
          navigate("/login");
        }}>🚪 Déconnexion</button>
      </div>

      <section className="card">
        <h3>👤 Ton profil</h3>
        <p>Pseudo : <strong>{pseudoAffiche}</strong></p>
        <p>Matchs joués : <strong>{totalMatchs}</strong></p>
        <p>Points : <strong>{stats.points ?? 0}</strong></p>
        <p>Victoires : <strong>{stats.victoires ?? 0}</strong></p>
        <p>Nuls : <strong>{stats.nul ?? 0}</strong></p>
        <p>Défaites : <strong>{stats.defaites ?? 0}</strong></p>
        <p>Buts marqués : <strong>{stats.butsPour ?? 0}</strong></p>
        <p>Buts encaissés : <strong>{stats.butsContre ?? 0}</strong></p>
        <p>Goal Average : <strong>{goalAverage}</strong></p>
        <p>Taux de victoire : <strong>{winRate}%</strong></p>
        <p>Efficacité (pts/match) : <strong>{efficacite}</strong></p>
      </section>

      <section className="card">
        <h3>📅 Tes 5 derniers matchs</h3>
        {matchs.length === 0 ? (
          <p>Aucun match trouvé.</p>
        ) : (
          matchs.map((m, i) => {
            const [uid1, uid2] = m.joueurs;
            const isUserFirst = uid1 === user.uid;
            const pseudo1 = joueursMap[uid1] || "Inconnu";
            const pseudo2 = joueursMap[uid2] || "Inconnu";

            let resultIcon = "⚪";
            let resultText = "à venir";
            let style = {};

            if (m.score) {
              const [score1, score2] = m.score.split("-").map(Number);
              const userScore = isUserFirst ? score1 : score2;
              const opponentScore = isUserFirst ? score2 : score1;

              if (userScore > opponentScore) {
                resultIcon = "🟢";
                resultText = "Victoire";
                style = { borderLeft: "4px solid green", paddingLeft: "0.5rem" };
              } else if (userScore < opponentScore) {
                resultIcon = "🔴";
                resultText = "Défaite";
                style = { borderLeft: "4px solid red", paddingLeft: "0.5rem" };
              } else {
                resultIcon = "⚪";
                resultText = "Égalité";
                style = { borderLeft: "4px solid gray", paddingLeft: "0.5rem" };
              }
            }

            return (
              <div key={i} className="match-card" style={style}>
                <p><strong>{new Date(m.date).toLocaleDateString()}</strong></p>
                <p>{pseudo1} vs {pseudo2}</p>
                <p>Score : <strong>{m.score || "—"}</strong></p>
                <p>{resultIcon} {resultText}</p>
              </div>
            );
          })
        )}
      </section>

      <section className="card">
        <h3>📜 Règles de la ligue</h3>
        {rules ? (
          <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.8" }}>
            {rules.split("\n").map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune règle définie.</p>
        )}
      </section>
    </div>
  );
}

export default JoueurDashboard;