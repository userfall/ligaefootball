import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import JoueurDashboard from "./pages/JoueurDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import JourneeManager from "./pages/JourneeManager";
import Classement from "./pages/Classement"; // ✅ nouvelle page
import ProtectedRoute from "./components/ProtectedRoute";

// Wrapper pour gérer la redirection automatique après login
const AutoRedirect = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  if (profile?.role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.role === "joueur") return <Navigate to="/joueur" replace />;

  return children; // utilisateur non connecté
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<AutoRedirect><Home /></AutoRedirect>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Pages Joueur */}
          <Route
            path="/joueur"
            element={
              <ProtectedRoute>
                <JoueurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classement"
            element={
              <ProtectedRoute>
                <Classement />
              </ProtectedRoute>
            }
          />

          {/* Pages Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journee"
            element={
              <ProtectedRoute adminOnly={true}>
                <JourneeManager />
              </ProtectedRoute>
            }
          />

          {/* Redirection pour toutes les autres routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}