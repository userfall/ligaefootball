import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const userProfile = docSnap.exists() ? docSnap.data() : null;

      if (!userProfile) {
        setError("❌ Profil introuvable dans Firestore.");
        setLoading(false);
        return;
      }

      // Redirection selon le rôle
      if (userProfile.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/joueur");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("❌ Aucun compte trouvé avec cet email.");
          break;
        case "auth/wrong-password":
          setError("❌ Mot de passe incorrect.");
          break;
        case "auth/invalid-email":
          setError("❌ Email invalide.");
          break;
        default:
          setError("❌ " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Connexion Mini-Liga ⚽</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : "Se connecter"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default Login;