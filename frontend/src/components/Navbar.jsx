import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const getNavLinkClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });  // 👈 after logout go to homepage
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container px-5">
        <Link className="navbar-brand fw-bold" to="/dashboard">TestTagger</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={getNavLinkClass('/dashboard')} to="/dashboard">Home</Link>
            </li>
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link className={getNavLinkClass('/profile')} to="/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link text-danger btn btn-link"
                    onClick={handleLogout}
                    style={{ textDecoration: 'none' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={getNavLinkClass('/login')} to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className={getNavLinkClass('/register')} to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
