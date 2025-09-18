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
             <a href="https://www.youtube.com/@Gladart7" className="social-link">Youtube</a>

         
           
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
     
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="https://www.instagram.com/about_art_13/">Help Center</a></li>
            <li><a href="https://www.instagram.com/about_art_13/">Contact Us</a></li>
            <li>you can directly contact us in our instagram... we will 100% answer you
            </li>
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
   <Link to="/privacy-policy">Privacy Policy</Link>
<Link to="/terms-of-service">Terms of Service</Link>
<Link to="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
