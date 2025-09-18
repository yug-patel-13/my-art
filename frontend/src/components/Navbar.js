import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isSignedIn, user, onSignOut, cartCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">
    <img src="my_logo.jpg" alt="logo" id='logo' /> 
          </span>
    
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/paintings" className="nav-link" onClick={closeMenu}>Paintings</Link>
          <Link to="/sketches" className="nav-link" onClick={closeMenu}>Sketches</Link>
          
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="search-icon">🔍</i>
            </button>
          </form>

          <div className="nav-auth">
            {isSignedIn ? (
              <>
                <span className="user-greeting">
                  Hello, {user && user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user && user.firstName
                      ? user.firstName
                      : 'User'
                  }!
                </span>
                <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                  Cart ({cartCount})
                </Link>
                <button onClick={() => { onSignOut(); closeMenu(); }} className="signout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="nav-link" onClick={closeMenu}>Sign In</Link>
                <Link to="/signup" className="nav-link signup-link" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
