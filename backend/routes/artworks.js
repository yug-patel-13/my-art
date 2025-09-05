const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all artworks with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { type, artist, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query;
    
    let query = `
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE is_active = true
    `;
    const queryParams = [];
    let paramCount = 1;

    // Add filters
    if (type) {
      query += ` AND type = $${paramCount++}`;
      queryParams.push(type);
    }

    if (artist) {
      query += ` AND artist ILIKE $${paramCount++}`;
      queryParams.push(`%${artist}%`);
    }

    // Add sorting
    const allowedSortFields = ['title', 'artist', 'price', 'created_at'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM artworks WHERE is_active = true';
    const countParams = [];
    let countParamCount = 1;

    if (type) {
      countQuery += ` AND type = $${countParamCount++}`;
      countParams.push(type);
    }

    if (artist) {
      countQuery += ` AND artist ILIKE $${countParamCount++}`;
      countParams.push(`%${artist}%`);
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
      }
    });

  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to retrieve artworks'
    });
  }
});

// Get single artwork by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork does not exist'
      });
    }

    res.json({
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({
      error: 'Failed to fetch artwork',
      message: 'Unable to retrieve artwork'
    });
  }
});

// Get artworks by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;

    const result = await pool.query(`
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE type = $1 AND is_active = true
      ORDER BY created_at DESC
    `, [type]);

    res.json({
      artworks: result.rows,
      type: type
    });

  } catch (error) {
    console.error('Get artworks by type error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to retrieve artworks by type'
    });
  }
});

// Get artworks by artist
router.get('/artist/:artist', async (req, res) => {
  try {
    const { artist } = req.params;

    const result = await pool.query(`
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE artist ILIKE $1 AND is_active = true
      ORDER BY created_at DESC
    `, [`%${artist}%`]);

    res.json({
      artworks: result.rows,
      artist: artist
    });

  } catch (error) {
    console.error('Get artworks by artist error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to retrieve artworks by artist'
    });
  }
});

// Create new artwork (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('artist').trim().isLength({ min: 1, max: 255 }).withMessage('Artist is required'),
  body('type').isIn(['painting', 'sketch']).withMessage('Type must be painting or sketch'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, artist, type, price, imageUrl, stockQuantity } = req.body;

    const result = await pool.query(`
      INSERT INTO artworks (title, description, artist, type, price, image_url, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, artist, type, price, image_url, stock_quantity, created_at
    `, [title, description, artist, type, price, imageUrl, stockQuantity]);

    res.status(201).json({
      message: 'Artwork created successfully',
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Create artwork error:', error);
    res.status(500).json({
      error: 'Failed to create artwork',
      message: 'Unable to create artwork'
    });
  }
});

// Update artwork (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title too long'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('artist').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Artist too long'),
  body('type').optional().isIn(['painting', 'sketch']).withMessage('Type must be painting or sketch'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    const allowedFields = ['title', 'description', 'artist', 'type', 'price', 'image_url', 'stock_quantity'];
    
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key === 'imageUrl' ? 'image_url' : key === 'stockQuantity' ? 'stock_quantity' : key;
        updates.push(`${dbField} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(`
      UPDATE artworks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, artist, type, price, image_url, stock_quantity, updated_at
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork does not exist'
      });
    }

    res.json({
      message: 'Artwork updated successfully',
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({
      error: 'Failed to update artwork',
      message: 'Unable to update artwork'
    });
  }
});

// Soft delete artwork (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE artworks 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork does not exist'
      });
    }

    res.json({
      message: 'Artwork deleted successfully',
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({
      error: 'Failed to delete artwork',
      message: 'Unable to delete artwork'
    });
  }
});

// Search artworks
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    const result = await pool.query(`
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
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
    `, [searchTerm]);

    res.json({
      artworks: result.rows,
      query: query,
      totalResults: result.rows.length
    });

  } catch (error) {
    console.error('Search artworks error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search artworks'
    });
  }
});

module.exports = router;