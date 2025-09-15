import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [showSketchForm, setShowSketchForm] = useState(false);
  const [showPaintingForm, setShowPaintingForm] = useState(false);
  const [sketchFormData, setSketchFormData] = useState({
    name: '',
    email: '',
    size: 'A4',
    peopleCount: 1,
    photo: null
  });
  const [paintingFormData, setPaintingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });

  const handleSketchFormChange = (e) => {
    const { name, value } = e.target;
    setSketchFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaintingFormChange = (e) => {
    const { name, value } = e.target;
    setPaintingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSketchFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const calculateSketchPrice = () => {
    let basePrice = 0;
    
    // Base price based on number of people
    switch (parseInt(sketchFormData.peopleCount)) {
      case 1:
        basePrice = 700;
        break;
      case 2:
        basePrice = 1200;
        break;
      case 3:
        basePrice = 1600;
        break;
      default:
        basePrice = 1600 + (parseInt(sketchFormData.peopleCount) - 3) * 400; // 400rs per additional person
    }

    // Size multiplier
    let sizeMultiplier = 1;
    switch (sketchFormData.size) {
      case 'A5':
        sizeMultiplier = 0.8; // 20% discount for smaller size
        break;
      case 'A4':
        sizeMultiplier = 1; // Standard price
        break;
      case 'A3':
        sizeMultiplier = 1.3; // 30% premium for larger size
        break;
      case 'A2':
        sizeMultiplier = 1.6; // 60% premium for extra large
        break;
      default:
        sizeMultiplier = 1;
    }

    return Math.round(basePrice * sizeMultiplier);
  };

  const handleSketchSubmit = async (e) => {
    e.preventDefault();
    const price = calculateSketchPrice();
    
    try {
      console.log('🎨 Submitting custom sketch order...');
      
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('name', sketchFormData.name);
      formData.append('email', sketchFormData.email);
      formData.append('size', sketchFormData.size);
      formData.append('numberOfPersons', sketchFormData.peopleCount);
      if (sketchFormData.photo) {
        formData.append('photo', sketchFormData.photo);
      }

      // Send to backend
      const response = await fetch('http://localhost:5000/api/custom-art/sketch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit sketch order');
      }

      console.log('✅ Custom sketch order submitted successfully:', result);
      
      alert(`Custom Sketch Order Submitted!\n\nName: ${sketchFormData.name}\nEmail: ${sketchFormData.email}\nSize: ${sketchFormData.size}\nPeople: ${sketchFormData.peopleCount}\nPhoto: ${sketchFormData.photo ? sketchFormData.photo.name : 'No photo uploaded'}\n\nTotal Price: ₹${price.toLocaleString()}\n\nWe'll contact you soon with further details!`);
      
      // Reset form
      setSketchFormData({
        name: '',
        email: '',
        size: 'A4',
        peopleCount: 1,
        photo: null
      });
      setShowSketchForm(false);

    } catch (error) {
      console.error('❌ Custom sketch submission failed:', error);
      alert('Failed to submit sketch order: ' + error.message);
    }
  };

  const handlePaintingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🎨 Submitting custom painting request...');
      
      // Send to backend
      const response = await fetch('http://localhost:5000/api/custom-art/painting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: paintingFormData.name,
          email: paintingFormData.email,
          phone: paintingFormData.phone,
          description: paintingFormData.comment
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit painting request');
      }

      console.log('✅ Custom painting request submitted successfully:', result);
      
      alert(`Custom Painting Request Submitted!\n\nName: ${paintingFormData.name}\nEmail: ${paintingFormData.email}\nPhone: ${paintingFormData.phone}\n\nYour Vision:\n${paintingFormData.comment}\n\nWe'll contact you within 24 hours to discuss your custom painting requirements and provide a personalized quote!\n\nThank you for choosing us as your first choice! 🎨`);
      
      // Reset form
      setPaintingFormData({
        name: '',
        email: '',
        phone: '',
        comment: ''
      });
      setShowPaintingForm(false);

    } catch (error) {
      console.error('❌ Custom painting submission failed:', error);
      alert('Failed to submit painting request: ' + error.message);
    }
  };

  const getSizeRecommendation = () => {
    const peopleCount = parseInt(sketchFormData.peopleCount);
    if (peopleCount === 1) {
      return "A4 or A5 size recommended for single person";
    } else if (peopleCount === 2) {
      return "A4 size recommended for 2 people";
    } else if (peopleCount === 3) {
      return "A3 size recommended for 3 people";
    } else {
      return "A3 or A2 size recommended for multiple people";
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Beautiful Artworks</h1>
          <p className="hero-subtitle">
            Explore our curated collection of stunning paintings and sketches from talented artists
          </p>
          <div className="hero-buttons">
            <Link to="/paintings" className="btn btn-primary">Browse Paintings</Link>
            <Link to="/sketches" className="btn btn-secondary">View Sketches</Link>
          </div>
          <div className="custom-art-buttons">
            <button 
              className="btn btn-custom-sketch"
              onClick={() => setShowSketchForm(true)}
            >
              ✏️ Make Your Own Sketch
            </button>
            <button 
              className="btn btn-custom-painting"
              onClick={() => setShowPaintingForm(true)}
            >
              🎨 Make Your Custom Painting
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="artwork-preview">
            <div className="floating-artwork artwork-1"></div>
            <div className="floating-artwork artwork-2"></div>
            <div className="floating-artwork artwork-3"></div>
          </div>
        </div>
      </section>

      {/* Custom Sketch Form Modal */}
      {showSketchForm && (
        <div className="modal-overlay" onClick={() => setShowSketchForm(false)}>
          <div className="modal-content custom-sketch-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSketchForm(false)}>×</button>
            <div className="modal-body">
              <h2>Create Your Custom Sketch</h2>
              <p className="form-description">Tell us about your vision and we'll create a unique sketch just for you!</p>
              
              <form onSubmit={handleSketchSubmit} className="custom-sketch-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={sketchFormData.name}
                    onChange={handleSketchFormChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={sketchFormData.email}
                    onChange={handleSketchFormChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Paper Size *</label>
                  <select
                    id="size"
                    name="size"
                    value={sketchFormData.size}
                    onChange={handleSketchFormChange}
                    required
                  >
                    <option value="A5">A5 (14.8 × 21 cm) - Small</option>
                    <option value="A4">A4 (21 × 29.7 cm) - Standard</option>
                    <option value="A3">A3 (29.7 × 42 cm) - Large</option>
                    <option value="A2">A2 (42 × 59.4 cm) - Extra Large</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="peopleCount">Number of People in Sketch *</label>
                  <select
                    id="peopleCount"
                    name="peopleCount"
                    value={sketchFormData.peopleCount}
                    onChange={handleSketchFormChange}
                    required
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5 People</option>
                    <option value="6">6+ People</option>
                  </select>
                  <small className="size-recommendation">{getSizeRecommendation()}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="photo">Upload Reference Photo</label>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    placeholder="Upload a photo for reference"
                  />
                  <small>Upload a photo to help us understand your vision (optional)</small>
                </div>

                <div className="price-preview">
                  <h3>Price Preview</h3>
                  <div className="price-breakdown">
                    <p><strong>Base Price ({sketchFormData.peopleCount} person{sketchFormData.peopleCount > 1 ? 's' : ''}):</strong> ₹{(() => {
                      const peopleCount = parseInt(sketchFormData.peopleCount);
                      if (peopleCount === 1) return 700;
                      if (peopleCount === 2) return 1200;
                      if (peopleCount === 3) return 1600;
                      return 1600 + (peopleCount - 3) * 400;
                    })()}</p>
                    <p><strong>Size Multiplier ({sketchFormData.size}):</strong> {(() => {
                      switch (sketchFormData.size) {
                        case 'A5': return '0.8x (20% discount)';
                        case 'A4': return '1.0x (standard)';
                        case 'A3': return '1.3x (30% premium)';
                        case 'A2': return '1.6x (60% premium)';
                        default: return '1.0x';
                      }
                    })()}</p>
                    <p className="total-price"><strong>Total Price: ₹{calculateSketchPrice().toLocaleString()}</strong></p>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSketchForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Custom Sketch Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Painting Form Modal */}
      {showPaintingForm && (
        <div className="modal-overlay" onClick={() => setShowPaintingForm(false)}>
          <div className="modal-content custom-painting-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPaintingForm(false)}>×</button>
            <div className="modal-body">
              <h2>Create Your Custom Painting</h2>
              <p className="form-description">Share your vision with us and we'll create a masterpiece just for you!</p>
              
              <form onSubmit={handlePaintingSubmit} className="custom-painting-form">
                <div className="form-group">
                  <label htmlFor="painting-name">Full Name *</label>
                  <input
                    type="text"
                    id="painting-name"
                    name="name"
                    value={paintingFormData.name}
                    onChange={handlePaintingFormChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="painting-email">Email Address *</label>
                  <input
                    type="email"
                    id="painting-email"
                    name="email"
                    value={paintingFormData.email}
                    onChange={handlePaintingFormChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="painting-phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="painting-phone"
                    name="phone"
                    value={paintingFormData.phone}
                    onChange={handlePaintingFormChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="painting-comment">Tell Us About Your Vision *</label>
                  <textarea
                    id="painting-comment"
                    name="comment"
                    value={paintingFormData.comment}
                    onChange={handlePaintingFormChange}
                    required
                    placeholder="Describe what you want in your custom painting... What style, colors, subject matter, size, or any specific details you have in mind?"
                    rows="6"
                  />
                  <small>Be as detailed as possible so we can understand your vision perfectly!</small>
                </div>

                <div className="privacy-notice">
                  <h3>🎨 Why Choose Us?</h3>
                  <div className="privacy-content">
                    <p><strong>Your Privacy is Our First Choice!</strong></p>
                    <p>We respect your privacy and will never share your information with third parties. Your custom painting request is confidential and secure.</p>
                    <p>We'll contact you within 24 hours to discuss your requirements and provide a personalized quote based on your vision.</p>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPaintingForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Custom Painting Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our Gallery?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Unique Artworks</h3>
              <p>Discover one-of-a-kind pieces from emerging and established artists</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Secure Shipping</h3>
              <p>Professional packaging and worldwide delivery to protect your artwork</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Safe Payment</h3>
              <p>Multiple payment options with secure transaction processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Quality Assured</h3>
              <p>Every piece is carefully selected and authenticated for quality</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2 className="section-title">Explore Our Collections</h2>
          <div className="categories-grid">
            <Link to="/paintings" className="category-card paintings">
              <div className="category-overlay">
                <h3>Paintings</h3>
                <p>Oil, acrylic, and watercolor masterpieces</p>
                <span className="category-count">13 pieces</span>
              </div>
            </Link>
            <Link to="/sketches" className="category-card sketches">
              <div className="category-overlay">
                <h3>Sketches</h3>
                <p>Pencil, charcoal, and ink drawings</p>
                <span className="category-count">19 pieces</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Art Collection?</h2>
            <p>Join thousands of art lovers who trust our gallery</p>
            <Link to="/signup" className="btn btn-primary">Get Started Today</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
