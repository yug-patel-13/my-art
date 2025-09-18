import React, { useState } from 'react';
import './Paintings.css';

const Paintings = ({ addToCart, buyNow, isSignedIn }) => {
  const [selectedPainting, setSelectedPainting] = useState(null);

  const paintings = [
    {
      id: 1,
      title: "The horse",
      artist: "Yug Patel",
      price: 996,
      medium: "Oil on Canvas",
      size: "24\" x 36\"",
      image: "/images/paintings/p1.jpeg",
      description: "The horse is a beautiful animal and it is a symbol of strength and freedom."
    },
    {
      id: 2,
      title: "The beautifull bird",
      artist: "Yug Patel",
      price: 579,
      medium: "Acrylic on Canvas",
      size: "30\" x 40\"",
      image: "/images/paintings/p2.jpeg",
      description: "The bird painting  is a symbol of beauty and freedom."
    },
    {
      id: 3,
      title: "Urban Dreams",
      artist: "Yug Patel",
      price: 500,
      medium: "Watercolor on Paper",
      size: "18\" x 24\"",
      image: "/images/paintings/p3.jpeg",
      description: "Contemporary cityscape with dreamlike qualities and urban poetry."
    },
    {
      id: 4,
      title: "Not for sale",
      artist: "Yug Patel",
      price: "not for sale",
      medium: "Oil on Canvas",
      size: "36\" x 48\"",
      image: "/images/paintings/p4.jpeg",
      description: "If you click on buy now but still you are not able to buy it then contact the artist."
    },
    {
      id: 5,
      title: "Tha Abstract Art",
      artist: "Yug Patel",
      price: 1299,
      medium: "Acrylic on Canvas",
      size: "20\" x 28\"",
      image: "/images/paintings/p5.jpeg",
      description: "The Abstract Art is at Every Moment of mood."
    },
    {
      id: 6,
      title: "Nature says",
      artist: "Yug Patel",
      price: 1156,
      medium: "Oil on Canvas",
      size: "26\" x 34\"",
      image: "/images/paintings/p6.jpeg",
      description: "Nature is from eyes and make it with colour and shape."
    },
    {
      id: 7,
      title: "Flowerpot ",
      artist: "Yug Patel",
      price: 899,
      medium: "Acrylic on Canvas",
      size: "22\" x 30\"",
      image: "/images/paintings/p7.jpeg",
      description: "The beautiful flowerpot in your home ."
    },
    {
      id: 8,
      title: "Flowerpot in the hand",
      artist: "Yug Patel",
      price: 789,
      medium: "Oil on Canvas",
      size: "32\" x 42\"",
      image: "/images/paintings/p8.jpeg",
      description: "Painting for eyes and depression."
    },
    {
      id: 9,
      title: "Not for sale",
      artist: "Yug Patel",
      price:"Not for sale",
      medium: "Watercolor on Paper",
      size: "16\" x 22\"",
      image: "/images/paintings/p9.jpeg",
      description: "If you click on buy now but still you are not able to buy it then contact the artist."
    },
    {
      id: 10,
      title: "Not for sale",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Acrylic on Canvas",
      size: "28\" x 38\"",
      image: "/images/paintings/p10.jpeg",
      description: "if you click on buy now but still you are not able to buy it then contact the artist."
    },
    {
      id: 11,
      title: "Not for sale ",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Oil on Canvas",
      size: "24\" x 32\"",
      image: "/images/paintings/p11.jpeg",
      description: "If you click on buy now but still you are not able to buy it then contact the artist."
    },
    {
      id: 12,
      title: "Not for sale",
      artist: "Yug Patel",
      price: "Not for sale",
      medium: "Acrylic on Canvas",
      size: "26\" x 36\"",
      image: "/images/paintings/p12.jpeg",
      description: "Not for sale"
    },
    {
      id: 13,
      title: "Sky Poetry",
      artist: "Yug Patel",
      price: 2000,
      medium: "Watercolor on Paper",
      size: "20\" x 26\"",
      image: "/images/paintings/p13.jpeg",
      description: "Feel the sky with your eyes."
    }
  ];

  // Helper to check if a painting is for sale
  const isForSale = (painting) => {
    // Accept both "Not for sale" and "not for sale" (case-insensitive)
    return !(
      typeof painting.price === "string" &&
      painting.price.trim().toLowerCase() === "not for sale"
    );
  };

  const handleAddToCart = (painting) => {
    addToCart({
      ...painting,
      type: 'painting'
    });
  };

  const handleBuyNow = (painting) => {
    buyNow({
      ...painting,
      type: 'painting'
    });
  };

  const openModal = (painting) => {
    setSelectedPainting(painting);
  };

  const closeModal = () => {
    setSelectedPainting(null);
  };

  return (
    <div className="paintings-page">
      <div className="page-header">
        <h1>Paintings Collection</h1>
        <p>Discover our curated selection of beautiful paintings from talented artists</p>
      </div>

      <div className="paintings-grid">
        {paintings.map((painting) => (
          <div key={painting.id} className="painting-card">
            <div className="painting-image" onClick={() => openModal(painting)}>
              <img src={painting.image} alt={painting.title} />
              <div className="painting-overlay">
                <span className="view-details">View Details</span>
              </div>
            </div>
            <div className="painting-info">
              <h3 className="painting-title">{painting.title}</h3>
              <p className="painting-artist">by {painting.artist}</p>
              <p className="painting-medium">{painting.medium}</p>
              <p className="painting-size">{painting.size}</p>
              <div className="painting-price">
                {typeof painting.price === "string"
                  ? painting.price
                  : `₹${painting.price.toLocaleString()}`}
              </div>
              <div className="painting-actions">
                {isForSale(painting) ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleAddToCart(painting)}
                      disabled={!isSignedIn}
                    >
                      {isSignedIn ? 'Add to Cart' : 'Sign In to Add'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBuyNow(painting)}
                      disabled={!isSignedIn}
                    >
                      {isSignedIn ? 'Buy Now' : 'Sign In to Buy'}
                    </button>
                  </>
                ) : (
                  <button className="btn btn-secondary" disabled>
                    Not for Sale
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPainting && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-body">
              <div className="modal-image">
                <img src={selectedPainting.image} alt={selectedPainting.title} />
              </div>
              <div className="modal-info">
                <h2>{selectedPainting.title}</h2>
                <p className="artist">by {selectedPainting.artist}</p>
                <p className="description">{selectedPainting.description}</p>
                <div className="details">
                  <p><strong>Medium:</strong> {selectedPainting.medium}</p>
                  <p><strong>Size:</strong> {selectedPainting.size}</p>
                  <p><strong>Price:</strong> {typeof selectedPainting.price === "string"
                    ? selectedPainting.price
                    : `₹${selectedPainting.price.toLocaleString()}`}</p>
                </div>
                <div className="modal-actions">
                  {isForSale(selectedPainting) ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleAddToCart(selectedPainting)}
                        disabled={!isSignedIn}
                      >
                        {isSignedIn ? 'Add to Cart' : 'Sign In to Add'}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleBuyNow(selectedPainting)}
                        disabled={!isSignedIn}
                      >
                        {isSignedIn ? 'Buy Now' : 'Sign In to Buy'}
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary" disabled>
                      Not for Sale
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paintings;
