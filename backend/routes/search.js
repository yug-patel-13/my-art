const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Advanced search with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      query,
      type,
      artist,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 12
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let searchQuery = `
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE is_active = true
    `;
    
    let conditions = [];
    let values = [];
    let paramCount = 1;

    // Text search
    if (query) {
      conditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR artist ILIKE $${paramCount})`);
      values.push(`%${query}%`);
      paramCount++;
    }

    // Type filter
    if (type) {
      conditions.push(`type = $${paramCount++}`);
      values.push(type);
    }

    // Artist filter
    if (artist) {
      conditions.push(`artist ILIKE $${paramCount++}`);
      values.push(`%${artist}%`);
    }

    // Price range filters
    if (minPrice) {
      conditions.push(`price >= $${paramCount++}`);
      values.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramCount++}`);
      values.push(parseFloat(maxPrice));
    }

    if (conditions.length > 0) {
      searchQuery += ' AND ' + conditions.join(' AND ');
    }

    // Validate sort parameters
    const allowedSortFields = ['title', 'artist', 'price', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    searchQuery += ` ORDER BY ${sortField} ${sortDirection} LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(searchQuery, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM artworks WHERE is_active = true';
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    // Get search suggestions
    let suggestions = [];
    if (query) {
      const suggestionsResult = await pool.query(`
        SELECT DISTINCT title, artist, type
        FROM artworks 
        WHERE is_active = true 
        AND (title ILIKE $1 OR artist ILIKE $1)
        LIMIT 5
      `, [`%${query}%`]);
      suggestions = suggestionsResult.rows;
    }

    res.json({
      results: result.rows,
      query: query || '',
      filters: {
        type: type || '',
        artist: artist || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || ''
      },
      sort: {
        by: sortBy,
        order: sortOrder
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      suggestions
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to perform search. Please try again.'
    });
  }
});

// Quick search (simple text search)
router.get('/quick', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = `%${q.trim()}%`;
    
    const result = await pool.query(`
      SELECT id, title, description, artist, type, price, image_url, stock_quantity
      FROM artworks 
      WHERE is_active = true 
      AND (title ILIKE $1 OR description ILIKE $1 OR artist ILIKE $1)
      ORDER BY 
        CASE 
          WHEN title ILIKE $1 THEN 1
          WHEN artist ILIKE $1 THEN 2
          WHEN description ILIKE $1 THEN 3
        END,
        created_at DESC
      LIMIT $2
    `, [searchQuery, parseInt(limit)]);

    res.json({
      query: q.trim(),
      results: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to perform quick search. Please try again.'
    });
  }
});

// Get search suggestions/autocomplete
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        suggestions: []
      });
    }

    const searchQuery = `%${q.trim()}%`;
    
    // Get title suggestions
    const titleResult = await pool.query(`
      SELECT DISTINCT title as suggestion, 'title' as type
      FROM artworks 
      WHERE is_active = true AND title ILIKE $1
      LIMIT $2
    `, [searchQuery, Math.ceil(parseInt(limit) / 2)]);

    // Get artist suggestions
    const artistResult = await pool.query(`
      SELECT DISTINCT artist as suggestion, 'artist' as type
      FROM artworks 
      WHERE is_active = true AND artist ILIKE $1
      LIMIT $2
    `, [searchQuery, Math.ceil(parseInt(limit) / 2)]);

    const suggestions = [
      ...titleResult.rows,
      ...artistResult.rows
    ].slice(0, parseInt(limit));

    res.json({
      query: q.trim(),
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: 'Unable to get search suggestions. Please try again.'
    });
  }
});

// Get search statistics (admin only)
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    // This would typically require admin authentication
    // For now, we'll make it available to all users
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(CASE WHEN type = 'painting' THEN 1 END) as total_paintings,
        COUNT(CASE WHEN type = 'sketch' THEN 1 END) as total_sketches,
        COUNT(DISTINCT artist) as unique_artists,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM artworks 
      WHERE is_active = true
    `);

    const artistStats = await pool.query(`
      SELECT 
        artist,
        COUNT(*) as artwork_count,
        AVG(price) as average_price
      FROM artworks 
      WHERE is_active = true
      GROUP BY artist
      ORDER BY artwork_count DESC
      LIMIT 10
    `);

    res.json({
      overview: stats.rows[0],
      topArtists: artistStats.rows
    });

  } catch (error) {
    console.error('Search stats error:', error);
    res.status(500).json({
      error: 'Failed to get search statistics',
      message: 'Unable to get search statistics. Please try again.'
    });
  }
});

// Get popular searches (mock data for now)
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    // In a real application, you would track search queries
    // For now, we'll return some mock popular searches
    const popularSearches = [
      { query: 'landscape', count: 45 },
      { query: 'portrait', count: 38 },
      { query: 'abstract', count: 32 },
      { query: 'nature', count: 28 },
      { query: 'modern', count: 25 },
      { query: 'classical', count: 22 },
      { query: 'colorful', count: 20 },
      { query: 'minimalist', count: 18 }
    ];

    res.json({
      popularSearches
    });

  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      error: 'Failed to get popular searches',
      message: 'Unable to get popular searches. Please try again.'
    });
  }
});

module.exports = router;