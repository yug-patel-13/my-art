const { pool } = require('./config/database');

async function resetArtworkIds() {
  try {
    console.log('🔄 Resetting artwork IDs to start from 1...');
    
    // Get all artworks
    const result = await pool.query('SELECT * FROM artworks ORDER BY id');
    const artworks = result.rows;
    
    // Clear artworks table
    await pool.query('DELETE FROM artworks');
    console.log('🗑️ Cleared artworks table');
    
    // Reset sequence
    await pool.query('ALTER SEQUENCE artworks_id_seq RESTART WITH 1');
    console.log('🔄 Reset sequence to start from 1');
    
    // Re-insert artworks with new IDs
    for (const artwork of artworks) {
      await pool.query(`
        INSERT INTO artworks (title, description, artist, type, price, image_url, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [artwork.title, artwork.description, artwork.artist, artwork.type, 
          artwork.price, artwork.image_url, artwork.stock_quantity]);
    }
    
    console.log(`✅ Re-inserted ${artworks.length} artworks with new IDs`);
    
    // Show the new IDs
    const newResult = await pool.query('SELECT id, title, type, price FROM artworks ORDER BY id');
    console.log('\n📋 Artworks with new IDs:');
    newResult.rows.forEach(artwork => {
      console.log(`ID: ${artwork.id} | ${artwork.type.toUpperCase()} | ${artwork.title} | ₹${artwork.price}`);
    });

  } catch (error) {
    console.error('❌ Error resetting IDs:', error.message);
  } finally {
    await pool.end();
  }
}

resetArtworkIds();
