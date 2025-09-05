const { Pool } = require('pg');

// This script helps you migrate from localhost to Railway database
async function migrateToRailway() {
  console.log('🚀 Migrating to Railway Database...');
  
  // Local database connection (your current setup)
  const localPool = new Pool({
    host: 'localhost',
    port:1234,
    database: 'art_gallery',
    user: 'postgres',
    password: 'postgres'
  });

  // Railway database connection (update these with your Railway credentials)
  const railwayPool = new Pool({
    host: process.env.DB_HOST || 'your-railway-db-host',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'railway',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your-railway-db-password'
  });

  try {
    // Test connections
    console.log('🔍 Testing database connections...');
    
    const localClient = await localPool.connect();
    console.log('✅ Local database connected');
    localClient.release();

    const railwayClient = await railwayPool.connect();
    console.log('✅ Railway database connected');
    railwayClient.release();

    // Export data from local database
    console.log('📤 Exporting data from local database...');
    
    const exportData = async (tableName) => {
      const result = await localPool.query(`SELECT * FROM ${tableName}`);
      return result.rows;
    };

    const users = await exportData('users');
    const artworks = await exportData('artworks');
    const orders = await exportData('orders');
    const orderItems = await exportData('order_items');
    const customSketches = await exportData('custom_sketches');
    const customPaintings = await exportData('custom_paintings');

    console.log(`📊 Exported data:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Artworks: ${artworks.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log(`   - Custom Sketches: ${customSketches.length}`);
    console.log(`   - Custom Paintings: ${customPaintings.length}`);

    // Import data to Railway database
    console.log('📥 Importing data to Railway database...');

    // Import users
    for (const user of users) {
      await railwayPool.query(`
        INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.first_name, user.last_name, user.email, user.password_hash, 
          user.phone, user.role, user.is_active, user.created_at, user.updated_at]);
    }

    // Import artworks
    for (const artwork of artworks) {
      await railwayPool.query(`
        INSERT INTO artworks (id, title, description, artist, type, price, image_url, stock_quantity, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [artwork.id, artwork.title, artwork.description, artwork.artist, artwork.type,
          artwork.price, artwork.image_url, artwork.stock_quantity, artwork.is_active,
          artwork.created_at, artwork.updated_at]);
    }

    // Import orders
    for (const order of orders) {
      await railwayPool.query(`
        INSERT INTO orders (id, user_id, order_number, total_amount, shipping_address, payment_method, payment_status, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [order.id, order.user_id, order.order_number, order.total_amount, 
          order.shipping_address, order.payment_method, order.payment_status, 
          order.status, order.created_at, order.updated_at]);
    }

    // Import order items
    for (const item of orderItems) {
      await railwayPool.query(`
        INSERT INTO order_items (id, order_id, artwork_id, quantity, price, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [item.id, item.order_id, item.artwork_id, item.quantity, item.price, item.created_at]);
    }

    // Import custom sketches
    for (const sketch of customSketches) {
      await railwayPool.query(`
        INSERT INTO custom_sketches (id, user_id, name, email, size, number_of_persons, photo_url, price, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [sketch.id, sketch.user_id, sketch.name, sketch.email, sketch.size,
          sketch.number_of_persons, sketch.photo_url, sketch.price, sketch.status,
          sketch.created_at, sketch.updated_at]);
    }

    // Import custom paintings
    for (const painting of customPaintings) {
      await railwayPool.query(`
        INSERT INTO custom_paintings (id, user_id, name, email, phone, description, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [painting.id, painting.user_id, painting.name, painting.email, painting.phone,
          painting.description, painting.status, painting.created_at, painting.updated_at]);
    }

    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your data is now on Railway database!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await localPool.end();
    await railwayPool.end();
  }
}

// Run migration
migrateToRailway();
