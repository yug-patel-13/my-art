import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Art Gallery</h3>
          <p>Discover and collect beautiful artworks from talented artists around the world. Your premier destination for original paintings and sketches.</p>
          <div className="social-links">
          
            <a href="https://www.instagram.com/about_art_13/" className="social-link">Instagram</a>
         
           
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/paintings">Paintings</Link></li>
            <li><Link to="/sketches">Sketches</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Account</h4>
          <ul className="footer-links">
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/signup">Create Account</Link></li>
            <li><a href="https://www.youtube.com/@Gladart7">My Orders</a></li>
            <li><a href="https://www.youtube.com/@Gladart7">Wishlist</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="https://www.youtube.com/@Gladart7">Help Center</a></li>
            <li><a href="https://www.youtube.com/@Gladart7">Contact Us</a></li>
            <li><a href="https://www.youtube.com/@Gladart7">Shipping Info</a></li>
            <li><a href="https://www.youtube.com/@Gladart7">Returns</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
        
            <p>📧 yug.patel.sings01@gmail.com</p>
            <p>📞 +91 9879492936</p>
            <p>🕒 Mon-Fri: 9AM-6PM</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Art Gallery. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="https://www.youtube.com/@Gladart7">Privacy Policy</a>
            <a href="https://www.youtube.com/@Gladart7">Terms of Service</a>
            <a href="https://www.youtube.com/@Gladart7">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
