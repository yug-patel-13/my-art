const { pool } = require('./config/database');

async function checkArtworks() {
  try {
    const result = await pool.query('SELECT id, title, artist, price FROM artworks WHERE is_active = true');
    console.log('📋 Available artworks in database:');
    result.rows.forEach(artwork => {
      console.log(`ID: ${artwork.id} | Title: ${artwork.title} | Artist: ${artwork.artist} | Price: ₹${artwork.price}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkArtworks();
