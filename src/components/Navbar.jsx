import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">Mini-Liga</div>
      <ul className="menu">
        <li><Link to="/">Home</Link></li>
        {user && profile?.role === "player" && <li><Link to="/joueur-dashboard">Dashboard</Link></li>}
        {user && profile?.role === "admin" && <li><Link to="/admin-dashboard">Admin</Link></li>}
        {user ? (
          <li><button onClick={signOut}>Logout</button></li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
