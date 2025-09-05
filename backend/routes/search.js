const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Advanced search with filters
router.get('/', async (req, res) => {
  try {
    const { 
      query, 
      type, 
      artist, 
      minPrice, 
      maxPrice, 
      sort = 'created_at', 
      order = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;

    let searchQuery = `
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 1;

    // Add text search
    if (query) {
      searchQuery += ` AND (title ILIKE $${paramCount++} OR description ILIKE $${paramCount++} OR artist ILIKE $${paramCount++})`;
      const searchTerm = `%${query}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add type filter
    if (type) {
      searchQuery += ` AND type = $${paramCount++}`;
      queryParams.push(type);
    }

    // Add artist filter
    if (artist) {
      searchQuery += ` AND artist ILIKE $${paramCount++}`;
      queryParams.push(`%${artist}%`);
    }

    // Add price filters
    if (minPrice) {
      searchQuery += ` AND price >= $${paramCount++}`;
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      searchQuery += ` AND price <= $${paramCount++}`;
      queryParams.push(parseFloat(maxPrice));
    }

    // Add sorting
    const allowedSortFields = ['title', 'artist', 'price', 'created_at'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    searchQuery += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    searchQuery += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(searchQuery, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM artworks WHERE is_active = true';
    const countParams = [];
    let countParamCount = 1;

    if (query) {
      countQuery += ` AND (title ILIKE $${countParamCount++} OR description ILIKE $${countParamCount++} OR artist ILIKE $${countParamCount++})`;
      const searchTerm = `%${query}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      countQuery += ` AND type = $${countParamCount++}`;
      countParams.push(type);
    }

    if (artist) {
      countQuery += ` AND artist ILIKE $${countParamCount++}`;
      countParams.push(`%${artist}%`);
    }

    if (minPrice) {
      countQuery += ` AND price >= $${countParamCount++}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countQuery += ` AND price <= $${countParamCount++}`;
      countParams.push(parseFloat(maxPrice));
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      artworks: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        query: query || '',
        type: type || '',
        artist: artist || '',
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        sort: sort,
        order: order
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to perform search'
    });
  }
});

// Quick search (simple text search)
router.get('/quick', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        artworks: [],
        query: q || '',
        totalResults: 0
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const result = await pool.query(`
      SELECT id, title, artist, type, price, image_url
      FROM artworks 
      WHERE is_active = true 
      AND (title ILIKE $1 OR artist ILIKE $1)
      ORDER BY 
        CASE 
          WHEN title ILIKE $1 THEN 1
          WHEN artist ILIKE $1 THEN 2
        END,
        created_at DESC
      LIMIT $2
    `, [searchTerm, parseInt(limit)]);

    res.json({
      artworks: result.rows,
      query: q,
      totalResults: result.rows.length
    });

  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({
      error: 'Quick search failed',
      message: 'Unable to perform quick search'
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        suggestions: []
      });
    }

    const searchTerm = `%${q.trim()}%`;

    // Get title suggestions
    const titleSuggestions = await pool.query(`
      SELECT DISTINCT title
      FROM artworks 
      WHERE is_active = true AND title ILIKE $1
      ORDER BY title
      LIMIT $2
    `, [searchTerm, parseInt(limit)]);

    // Get artist suggestions
    const artistSuggestions = await pool.query(`
      SELECT DISTINCT artist
      FROM artworks 
      WHERE is_active = true AND artist ILIKE $1
      ORDER BY artist
      LIMIT $2
    `, [searchTerm, parseInt(limit)]);

    const suggestions = [
      ...titleSuggestions.rows.map(row => ({ type: 'title', value: row.title })),
      ...artistSuggestions.rows.map(row => ({ type: 'artist', value: row.artist }))
    ];

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.value === suggestion.value)
      )
      .slice(0, parseInt(limit));

    res.json({
      suggestions: uniqueSuggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: 'Unable to retrieve search suggestions'
    });
  }
});

// Get search statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total artworks
    const totalArtworks = await pool.query('SELECT COUNT(*) FROM artworks WHERE is_active = true');
    
    // Get artworks by type
    const artworksByType = await pool.query(`
      SELECT type, COUNT(*) as count 
      FROM artworks 
      WHERE is_active = true
      GROUP BY type
    `);
    
    // Get unique artists
    const uniqueArtists = await pool.query(`
      SELECT COUNT(DISTINCT artist) as count 
      FROM artworks 
      WHERE is_active = true
    `);
    
    // Get price range
    const priceRange = await pool.query(`
      SELECT MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price
      FROM artworks 
      WHERE is_active = true
    `);

    res.json({
      totalArtworks: parseInt(totalArtworks.rows[0].count),
      artworksByType: artworksByType.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count);
        return acc;
      }, {}),
      uniqueArtists: parseInt(uniqueArtists.rows[0].count),
      priceRange: {
        min: parseFloat(priceRange.rows[0].min_price) || 0,
        max: parseFloat(priceRange.rows[0].max_price) || 0,
        average: parseFloat(priceRange.rows[0].avg_price) || 0
      }
    });

  } catch (error) {
    console.error('Search stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch search statistics',
      message: 'Unable to retrieve search statistics'
    });
  }
});

module.exports = router;