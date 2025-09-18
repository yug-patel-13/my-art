import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Search.css';

const Search = ({ addToCart, buyNow, isSignedIn }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample data - in a real app, this would come from an API
  const paintings = useMemo(() => [
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
  ], []);

  const sketches = useMemo(() => [
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
    }
  ], []);

  useEffect(() => {
    // Combine all artworks
    const allArtworks = [...paintings, ...sketches];
    
    // Filter based on search query
    const filtered = allArtworks.filter(artwork => {
      const searchTerm = query.toLowerCase();
      return (
        artwork.title.toLowerCase().includes(searchTerm) ||
        artwork.artist.toLowerCase().includes(searchTerm) ||
        artwork.description.toLowerCase().includes(searchTerm) ||
        artwork.medium.toLowerCase().includes(searchTerm)
      );
    });
    
    setSearchResults(filtered);
    setFilteredResults(filtered);
  }, [query, paintings, sketches]);

  useEffect(() => {
    // Filter by category
    if (selectedCategory === 'all') {
      setFilteredResults(searchResults);
    } else {
      setFilteredResults(searchResults.filter(artwork => artwork.type === selectedCategory));
    }
  }, [selectedCategory, searchResults]);

  const handleAddToCart = (artwork) => {
    addToCart(artwork);
  };

  const handleBuyNow = (artwork) => {
    buyNow(artwork);
  };

  if (!query.trim()) {
    return (
      <div className="search-page">
        <div className="search-empty">
          <h2>Search Artworks</h2>
          <p>Use the search bar above to find beautiful artworks</p>
        </div>
      </div>
    );
  }

  // Helper to check if artwork is for sale
  const isForSale = (artwork) => {
    // Accepts both "Not for sale" and "not for sale" (case-insensitive)
    if (typeof artwork.price === 'string') {
      return artwork.price.trim().toLowerCase() !== 'not for sale';
    }
    return true;
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{query}"</p>
      </div>

      <div className="search-filters">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All ({searchResults.length})
          </button>
        
         
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="search-no-results">
          <h3>No results found</h3>
          <p>Try adjusting your search terms or browse our collections</p>
          <div className="search-actions">
            <Link to="/paintings" className="btn btn-primary">Browse Paintings</Link>
            <Link to="/sketches" className="btn btn-secondary">View Sketches</Link>
          </div>
        </div>
      ) : (
        <div className="search-results">
          {filteredResults.map((artwork) => (
            <div key={`${artwork.type}-${artwork.id}`} className="search-result-item">
              <div className="result-image">
                <img src={artwork.image} alt={artwork.title} />
             
              </div>
              <div className="result-info">
                <h3 className="result-title">{artwork.title}</h3>
                <p className="result-artist">by {artwork.artist}</p>
                <p className="result-medium">{artwork.medium}</p>
                <p className="result-size">{artwork.size}</p>
                <p className="result-description">{artwork.description}</p>
                <div className="result-price">
                  {typeof artwork.price === 'number'
                    ? `₹${artwork.price.toLocaleString()}`
                    : artwork.price}
                </div>
              </div>
              {isForSale(artwork) && (
                <div className="result-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddToCart(artwork)}
                    disabled={!isSignedIn}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleBuyNow(artwork)}
                    disabled={!isSignedIn}
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
