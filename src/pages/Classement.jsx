import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

function Classement() {
  const [classement, setClassement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userPseudo, setUserPseudo] = useState("");

  useEffect(() => {
    const pseudo = localStorage.getItem("pseudo");
    if (pseudo) setUserPseudo(pseudo);
  }, []);

  useEffect(() => {
    const fetchClassement = async () => {
      setLoading(true);
      try {
        const [standingsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "standings")),
          getDocs(collection(db, "users"))
        ]);

        const usersMap = Object.fromEntries(
          usersSnap.docs.map((doc) => [doc.id, doc.data().pseudo])
        );

        const data = standingsSnap.docs.map((doc) => {
          const joueur = doc.data();
          return {
            id: doc.id,
            ...joueur,
            pseudo: usersMap[joueur.uid] || "?",
            matchs: joueur.matchs ?? 0,
            butsPour: joueur.butsPour ?? 0,
            butsContre: joueur.butsContre ?? 0
          };
        });

        const sorted = data.sort((a, b) => Number(b.points) - Number(a.points));
        setClassement(sorted);
      } catch (err) {
        console.error("Erreur lors du chargement du classement :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassement();
  }, []);

  const filtered = useMemo(() => {
    return classement.filter((j) =>
      (j.pseudo || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [classement, search]);

  const getMedal = (index) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] || index + 1;
  };

  if (loading) return <div>⏳ Chargement du classement…</div>;

  return (
    <div className="container" style={{ padding: "1rem" }}>
      <h2>🏆 Classement Mini-Liga</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un pseudo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem", marginRight: "1rem" }}
        />
        <Link to="/">
          <button style={{ padding: "0.5rem 1rem" }}>🏠 Accueil</button>
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>#</th>
            <th>Joueur</th>
            <th>Points</th>
            <th>Matchs</th>
            <th>Victoires</th>
            <th>Nuls</th>
            <th>Défaites</th>
            <th>Buts +</th>
            <th>Buts -</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((j, index) => {
            const isUser = j.pseudo === userPseudo;
            const rowStyle = {
              backgroundColor: isUser ? "#f0f8ff" : "",
              fontWeight: isUser ? "bold" : "normal"
            };

            return (
              <tr key={j.id} style={rowStyle}>
                <td>{getMedal(index)}</td>
                <td>{j.pseudo}</td>
                <td>{j.points ?? 0}</td>
                <td>{j.matchs}</td>
                <td>{j.victoires ?? 0}</td>
                <td>{j.nul ?? 0}</td>
                <td>{j.defaites ?? 0}</td>
                <td>{j.butsPour}</td>
                <td>{j.butsContre}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Classement;