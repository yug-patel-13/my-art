const { pool } = require('./config/database');

async function addMoreArtworks() {
  try {
    console.log('🎨 Adding more artworks to match frontend data...');
    
    const artworks = [
      // Paintings
      {
        title: "Abstract Harmony",
        description: "A vibrant abstract composition exploring color relationships and emotional expression.",
        artist: "Yug Patel",
        type: "painting",
        price: 99600,
        image_url: "paintings/p1.jpeg",
        stock_quantity: 5
      },
      {
        title: "Mountain Serenity",
        description: "Peaceful mountain landscape capturing the tranquility of nature's majesty.",
        artist: "Yug Patel",
        type: "painting",
        price: 149400,
        image_url: "paintings/p2.jpeg",
        stock_quantity: 3
      },
      {
        title: "Urban Dreams",
        description: "Contemporary cityscape reflecting the energy and complexity of urban life.",
        artist: "Yug Patel",
        type: "painting",
        price: 124500,
        image_url: "paintings/p3.jpeg",
        stock_quantity: 4
      },
      {
        title: "Ocean Waves",
        description: "Dynamic seascape capturing the power and beauty of ocean waves.",
        artist: "Yug Patel",
        type: "painting",
        price: 112200,
        image_url: "paintings/p4.jpeg",
        stock_quantity: 2
      },
      {
        title: "Floral Symphony",
        description: "Beautiful floral arrangement celebrating nature's colorful palette.",
        artist: "Yug Patel",
        type: "painting",
        price: 87000,
        image_url: "paintings/p5.jpeg",
        stock_quantity: 6
      },
      {
        title: "Sunset Reflections",
        description: "Serene sunset scene with beautiful reflections on water.",
        artist: "Yug Patel",
        type: "painting",
        price: 135600,
        image_url: "paintings/p6.jpeg",
        stock_quantity: 3
      },
      {
        title: "Forest Path",
        description: "Mystical forest path leading into the depths of nature's beauty.",
        artist: "Yug Patel",
        type: "painting",
        price: 102300,
        image_url: "paintings/p7.jpeg",
        stock_quantity: 4
      },
      {
        title: "City Lights",
        description: "Vibrant cityscape at night with glowing lights and urban energy.",
        artist: "Yug Patel",
        type: "painting",
        price: 118800,
        image_url: "paintings/p8.jpeg",
        stock_quantity: 2
      },
      
      // Sketches
      {
        title: "Portrait Study",
        description: "Detailed portrait study capturing the essence of human expression and character.",
        artist: "Yug Patel",
        type: "sketch",
        price: 37350,
        image_url: "sketches/s1.jpeg",
        stock_quantity: 8
      },
      {
        title: "Urban Architecture",
        description: "Urban architectural sketch with strong lines and dramatic shadows.",
        artist: "Yug Patel",
        type: "sketch",
        price: 31540,
        image_url: "sketches/s2.jpeg",
        stock_quantity: 6
      },
      {
        title: "Nature's Details",
        description: "Intricate sketch of natural elements showing attention to botanical detail.",
        artist: "Yug Patel",
        type: "sketch",
        price: 28750,
        image_url: "sketches/s3.jpeg",
        stock_quantity: 7
      },
      {
        title: "Character Design",
        description: "Creative character sketch showcasing artistic imagination and style.",
        artist: "Yug Patel",
        type: "sketch",
        price: 42000,
        image_url: "sketches/s4.jpeg",
        stock_quantity: 5
      },
      {
        title: "Architectural Study",
        description: "Detailed architectural study with precise lines and perspective.",
        artist: "Yug Patel",
        type: "sketch",
        price: 35200,
        image_url: "sketches/s5.jpeg",
        stock_quantity: 4
      },
      {
        title: "Animal Portrait",
        description: "Expressive animal portrait capturing personality and character.",
        artist: "Yug Patel",
        type: "sketch",
        price: 33800,
        image_url: "sketches/s6.jpeg",
        stock_quantity: 6
      },
      {
        title: "Landscape Sketch",
        description: "Quick landscape sketch capturing the essence of natural scenery.",
        artist: "Yug Patel",
        type: "sketch",
        price: 29800,
        image_url: "sketches/s7.jpeg",
        stock_quantity: 8
      },
      {
        title: "Abstract Lines",
        description: "Abstract sketch exploring form, line, and artistic expression.",
        artist: "Yug Patel",
        type: "sketch",
        price: 26400,
        image_url: "sketches/s8.jpeg",
        stock_quantity: 9
      }
    ];

    // Clear existing artworks first
    await pool.query('DELETE FROM artworks');
    console.log('🗑️ Cleared existing artworks');

    // Insert new artworks
    for (const artwork of artworks) {
      await pool.query(`
        INSERT INTO artworks (title, description, artist, type, price, image_url, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [artwork.title, artwork.description, artwork.artist, artwork.type, 
          artwork.price, artwork.image_url, artwork.stock_quantity]);
    }

    console.log(`✅ Added ${artworks.length} artworks to database`);
    
    // Show what was added
    const result = await pool.query('SELECT id, title, type, price FROM artworks ORDER BY id');
    console.log('\n📋 Current artworks in database:');
    result.rows.forEach(artwork => {
      console.log(`ID: ${artwork.id} | ${artwork.type.toUpperCase()} | ${artwork.title} | ₹${artwork.price}`);
    });

  } catch (error) {
    console.error('❌ Error adding artworks:', error.message);
  } finally {
    await pool.end();
  }
}

addMoreArtworks();
