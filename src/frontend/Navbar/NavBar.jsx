import React, { useEffect, useState } from 'react';
import './Navbar.css'


const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
      async function loadUser(){
        try{
          const token = localStorage.getItem('accessToken');
          if(!token){ setUser(null); return; }
          const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
          if(!res.ok) throw new Error('unauth');
          const data = await res.json();
          setUser(data);
        }catch{
          setUser(null);
        }
      }
      loadUser();
    }, []);

    async function handleLogout(){
      try{ await fetch('/api/auth/logout', { method:'POST', credentials:'include' }); }catch{}
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }

    return (
        <nav className="navbar">
          <div className='white'>
          <div className="navbar-container">
            
            <a href="/" className="navbar-logo">ZotBoost</a>
            
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
              <a href="exercise" className="navbar-link ">Exercise</a>
              <a href="nutrition" className="navbar-link ">Nutrition</a>
              {user ? (
                <div className="navbar-user">
                  <span className="navbar-link">Hi, {user.name || 'User'}</span>
                  <button className="btn btn-login" onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <a href="login" className="btn btn-login">Login</a>
              )}
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