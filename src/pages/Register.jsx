import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPseudo = pseudo.trim();

    if (password.length < 6) {
      setError("❌ Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (trimmedPseudo.length < 3) {
      setError("❌ Le pseudo doit contenir au moins 3 caractères.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const profile = {
        uid: user.uid,
        email: user.email,
        pseudo: trimmedPseudo || user.displayName || "Joueur",
        role: "joueur",
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), profile);

      navigate("/joueur");
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("❌ Cet email est déjà utilisé.");
          break;
        case "auth/invalid-email":
          setError("❌ Email invalide.");
          break;
        case "auth/weak-password":
          setError("❌ Mot de passe trop faible.");
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
      <h2>Inscription Mini-Liga ⚽</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
        />
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
          {loading ? "Chargement..." : "S'inscrire"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default Register;