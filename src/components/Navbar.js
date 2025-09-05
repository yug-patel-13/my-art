import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isSignedIn, user, onSignOut, cartCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSketchForm, setShowSketchForm] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Art Gallery</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/paintings" className="nav-link">Paintings</Link>
          <Link to="/sketches" className="nav-link">Sketches</Link>
          
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
                <Link to="/cart" className="nav-link cart-link">
                  Cart ({cartCount})
                </Link>
                <button onClick={onSignOut} className="signout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="nav-link">Sign In</Link>
                <Link to="/signup" className="nav-link signup-link">Sign Up</Link>
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
