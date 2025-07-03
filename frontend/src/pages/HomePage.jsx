import React from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../assets/styles.css"; 
import Navbar from "../components/Navbar";

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="d-flex w-100 align-self-stretch flex-grow-1 flex-column min-vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <Navbar />

      {/* Hero Section */}
      <section className="hero w-100 align-self-stretch flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-5" style={{ height: "50vh" }}>
        <div className="container-fluid px-5">
          <h1 className="fw-semibold display-5">Welcome to TestTagger!</h1>
          <p className="fs-5 mt-3">Quickly categorize your test cases using our powerful AI-driven tool. Get insights and predictions with just a few clicks.</p>
          <Link to="/login" className="btn btn-light hero-btn px-4 py-3 mt-4">Login to Start</Link>
        </div>
      </section>

  

      {/* Footer */}
      <footer className="bg-light py-3 text-center mt-auto">
        <p className="mb-0">&copy; 2025 TestTagger. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
