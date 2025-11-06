import React, { useState } from 'react';
import './Navbar.css'


const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
          <div className='white'>
          <div className="navbar-container">
            
            <a href="/" className="navbar-logo">Zot Exercise</a>
            
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
              <a href="exercise" className="navbar-link ">Exercise</a>
              <a href="nutrition" className="navbar-link ">Nutrition</a>
              <a href="login" className="btn btn-login">Login</a>
            </div>
  
            <button 
              className="navbar-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            </div>          
          </div>
        </nav>

    );
  }
  
  export default NavBar