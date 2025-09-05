import React, { useState } from 'react';
import './Sketches.css';

const Sketches = () => {
  const [selectedSketch, setSelectedSketch] = useState(null);

  // All sketches are for example only, not for sale
  const sketches = [
    {
      id: 1,
      title: "Deepika Padukone",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Graphite on Paper",
      size: "11\" x 14\"",
      image: "/images/sketches/s7.jpeg",
      description: "Detailed portrait study capturing the essence of human expression and character. (Example only, not for sale)"
    },
    
    {
      id: 2,
      title: "Kishore Kumar",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Pencil on Paper",
      size: "12\" x 16\"",
      image: "/images/sketches/s3.jpeg",
      description: "Intricate nature study focusing on botanical details and textures. (Example only, not for sale)"
    },
    {
      id: 3,
      title: "messi",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Ink on Paper",
      size: "14\" x 18\"",
      image: "/images/sketches/s4.jpeg",
      description: "Dynamic abstract composition exploring geometric and organic forms. (Example only, not for sale)"
    },
    {
      id: 4,
      title: "pushpa ",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Graphite on Paper",
      size: "13\" x 17\"",
      image: "/images/sketches/s5.jpeg",
      description: "Wildlife sketch capturing the grace and movement of animals. (Example only, not for sale)"
    },
    {
      id: 5,
      title: "Rohit sharma",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Charcoal on Paper",
      size: "15\" x 19\"",
      image: "/images/sketches/s6.jpeg",
      description: "Classic still life arrangement with dramatic lighting and composition. (Example only, not for sale)"
    },
    
    {
      id: 6,
      title: "Jethalal",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Graphite on Paper",
      size: "18\" x 24\"",
      image: "/images/sketches/s8.jpeg",
      description: "Dynamic figure study with emphasis on anatomy and movement. (Example only, not for sale)"
    },
    {
      id: 7,
      title: "Shree ram ji",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Ink on Paper",
      size: "12\" x 15\"",
      image: "/images/sketches/s9.jpeg",
      description: "Detailed botanical illustration with scientific accuracy and artistic beauty. (Example only, not for sale)"
    },
    {
      id: 8,
      title: "Adheera",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Charcoal on Paper",
      size: "14\" x 20\"",
      image: "/images/sketches/s10.jpeg",
      description: "Urban street scene capturing the energy and atmosphere of city life. (Example only, not for sale)"
    },
    {
      id: 9,
      title: "Arijit singh",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Graphite on Paper",
      size: "13\" x 18\"",
      image: "/images/sketches/s11.jpeg",
      description: "Expressive sketch conveying deep emotions and human experience. (Example only, not for sale)"
    },
    {
      id: 10,
      title: "Monalisa",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Ink on Paper",
      size: "15\" x 21\"",
      image: "/images/sketches/s12.jpeg",
      description: "Complex geometric patterns with mathematical precision and artistic flair. (Example only, not for sale)"
    },
    {
      id: 11,
      title: "Gandhijee",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Pencil on Paper",
      size: "16\" x 20\"",
      image: "/images/sketches/s13.jpeg",
      description: "Detailed wildlife portrait capturing the character of wild animals. (Example only, not for sale)"
    },
    {
      id: 12,
      title: "shubhashchandra bose",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Ink on Paper",
      size: "14\" x 19\"",
      image: "/images/sketches/s14.jpeg",
      description: "Flowing abstract lines creating rhythm and movement on paper. (Example only, not for sale)"
    },
    
    {
      id: 13,
      title: "sunil chhetri",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Charcoal on Paper",
      size: "15\" x 20\"",
      image: "/images/sketches/s16.jpeg",
      description: "Natural elements study focusing on textures and organic forms. (Example only, not for sale)"
    },
    {
      id: 14,
      title: "The Old lady",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Pencil on Paper",
      size: "13\" x 17\"",
      image: "/images/sketches/s17.jpeg",
      description: "Quick urban sketch capturing the essence of city architecture. (Example only, not for sale)"
    },
    {
      id: 15,
      title: "sidhu moosewala",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Ink on Paper",
      size: "16\" x 22\"",
      image: "/images/sketches/s18.jpeg",
      description: "Complex abstract composition with multiple layers and depth. (Example only, not for sale)"
    },
   
  ];

  // No add to cart or buy now for sketches, as they are not for sale
  const openModal = (sketch) => {
    setSelectedSketch(sketch);
  };

  const closeModal = () => {
    setSelectedSketch(null);
  };

  return (
    <div className="sketches-page">
      <div className="page-header">
        <h1>Sketches Collection</h1>
        <p>
          Explore our diverse collection of hand-drawn sketches and illustrations.<br />
          <strong>Note: These sketches are for example only and are not for sale.</strong>
        </p>
      </div>

      <div className="sketches-grid">
        {sketches.map((sketch) => (
          <div key={sketch.id} className="sketch-card">
            <div className="sketch-image" onClick={() => openModal(sketch)}>
              <img src={sketch.image} alt={sketch.title} />
              <div className="sketch-overlay">
                <span className="view-details">View Details</span>
              </div>
            </div>
            <div className="sketch-info">
              <h3 className="sketch-title">{sketch.title}</h3>
              <p className="sketch-artist">by {sketch.artist}</p>
              <p className="sketch-medium">{sketch.medium}</p>
              <p className="sketch-size">{sketch.size}</p>
              <div className="sketch-price">
                {typeof sketch.price === "string" ? sketch.price : `₹${sketch.price.toLocaleString()}`}
              </div>
              <div className="sketch-actions">
                <button className="btn btn-secondary" disabled>
                  Not for Sale
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSketch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-body">
              <div className="modal-image">
                <img src={selectedSketch.image} alt={selectedSketch.title} />
              </div>
              <div className="modal-info">
                <h2>{selectedSketch.title}</h2>
                <p className="artist">by {selectedSketch.artist}</p>
                <p className="description">{selectedSketch.description}</p>
                <div className="details">
                  <p><strong>Medium:</strong> {selectedSketch.medium}</p>
                  <p><strong>Size:</strong> {selectedSketch.size}</p>
                  <p><strong>Price:</strong> {typeof selectedSketch.price === "string" ? selectedSketch.price : `₹${selectedSketch.price.toLocaleString()}`}</p>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" disabled>
                    Not for Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sketches;
