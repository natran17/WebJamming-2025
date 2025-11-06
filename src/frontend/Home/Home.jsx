import React, { useState } from 'react';
import NavBar from '../Navbar/NavBar';
import './Home.css'


const Home = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="page-wrapper">
          <NavBar/>
        
        <div className='home'>
        <header className="hero-section">
          <div className="hero-background">
            <img 
              src="https://cdn.prod.website-files.com/68011fed23249a9699d7b42b/6802f26cb1c279ff927f7887_visualelectric-1744594470866.avif" 
              alt="Peaceful landscape with city skyline" 
              className="hero-image"
            />
            <div className="hero-overlay"></div>
          
          
          <div className='hero-title-wrapper'>
            <h1 className="hero-title">BE Better!</h1>
            <a href="Login" className="starting-link">Get Started</a>
            </div>
          </div>
        </header>
        </div>
      </div>
      );
  }
  
  export default Home