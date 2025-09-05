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
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://pinterest.com" className="social-link" target="_blank" rel="noopener noreferrer">Pinterest</a>
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
            <li><a href="/orders" className="footer-link">My Orders</a></li>
            <li><a href="/wishlist" className="footer-link">Wishlist</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="/help" className="footer-link">Help Center</a></li>
            <li><a href="/contact" className="footer-link">Contact Us</a></li>
            <li><a href="/shipping" className="footer-link">Shipping Info</a></li>
            <li><a href="/returns" className="footer-link">Returns</a></li>
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
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
            <a href="/cookies" className="footer-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
