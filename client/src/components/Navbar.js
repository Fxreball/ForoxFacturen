import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png"; 

function Navbar() {
  return (
    <div className="nav">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-image" /> 
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/services" className="nav-link">Services</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
        <Link to="/invoice" className="nav-link">Invoice</Link>
      </div>
    </div>
  );
}

export default Navbar;
