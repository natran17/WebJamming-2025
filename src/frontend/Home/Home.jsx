import React, { useState } from 'react';
import './Home.css'


const Home = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="page-wrapper">
        {/* Navigation */}
        <nav className="navbar">
          <div className="navbar-container">
            <a href="#" className="navbar-logo">Zot Exercise</a>
            
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
              <a href="#exercise" className="btn btn-donate">Exercise</a>
              <a href="#nutrition" className="btn btn-donate">Nutrition</a>
              <a href="#aboutyou" className="btn btn-donate">About you</a>
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
        </nav>
        <div className='home'>
            <h2>hello does this shit even work</h2>
        
        <header className="hero-section">
          <div className="hero-background">
            <img 
              src="https://cdn.prod.website-files.com/68011fed23249a9699d7b42b/6802f26cb1c279ff927f7887_visualelectric-1744594470866.avif" 
              alt="Peaceful landscape with city skyline" 
              className="hero-image"
            />
            <div className="hero-overlay"></div>
          
          
          <div>
            <h1 className="hero-title">Zot Better!</h1>
            <p className="hero-description">
              Lets zot better! Be healther and more fit! Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah Blah
            </p>
            </div>
          </div>
        </header>
        </div>
      </div>
      );
  }
  
  export default Home