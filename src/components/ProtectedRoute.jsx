import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { isAdminFromProfile } from "../services/authService";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user && adminOnly) {
        try {
          const result = await isAdminFromProfile(user.uid);
          setIsAdmin(result);
        } catch (error) {
          console.error("Erreur lors de la vérification admin :", error);
          setIsAdmin(false);
        }
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, adminOnly]);

  if (loading || checking) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Chargement… ⏳
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/joueur" replace />;
  }

  return children;
};

export default ProtectedRoute;