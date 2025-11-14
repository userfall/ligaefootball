import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { profile, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="container">
      <h1>⚽ Bienvenue dans Mini-Liga eFootball</h1>
      <p>
        Mini-Liga est une compétition amicale entre joueurs passionnés de eFootball.
        Chaque match compte, chaque but est décisif. Rejoins-nous pour vivre l’intensité du jeu !
      </p>

      <section className="card">
        <h3>🎮 Pourquoi participer ?</h3>
        <ul>
          <li>Classement dynamique et transparent</li>
          <li>Statistiques personnelles et trophées</li>
          <li>Interface simple et rapide</li>
          <li>Ambiance fair-play et compétitive</li>
        </ul>
      </section>

      <section className="card" style={{ textAlign: "center" }}>
        {profile ? (
          <p>Connecté en tant que : <strong>{profile.pseudo}</strong> ({profile.role})</p>
        ) : (
          <>
            <Link to="/register">
              <button style={{ marginRight: "1rem" }}>S’inscrire</button>
            </Link>
            <Link to="/login">
              <button>Se connecter</button>
            </Link>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
