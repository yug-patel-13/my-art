const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all artworks with filters and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      type, 
      artist, 
      minPrice, 
      maxPrice, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
      FROM artworks 
      WHERE is_active = true
    `;
    
    let conditions = [];
    let values = [];
    let paramCount = 1;

    if (type) {
      conditions.push(`type = $${paramCount++}`);
      values.push(type);
    }

    if (artist) {
      conditions.push(`artist ILIKE $${paramCount++}`);
      values.push(`%${artist}%`);
    }

    if (minPrice) {
      conditions.push(`price >= $${paramCount++}`);
      values.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramCount++}`);
      values.push(parseFloat(maxPrice));
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    // Validate sort parameters
    const allowedSortFields = ['title', 'artist', 'price', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${sortDirection} LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM artworks WHERE is_active = true';
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      artworks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to fetch artworks. Please try again.'
    });
  }
});

// Get single artwork by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at FROM artworks WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'Artwork not found'
      });
    }

    res.json({
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({
      error: 'Failed to fetch artwork',
      message: 'Unable to fetch artwork. Please try again.'
    });
  }
});

// Get artworks by type
router.get('/type/:type', optionalAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!['painting', 'sketch'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        message: 'Type must be either painting or sketch'
      });
    }

    const result = await pool.query(
      'SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at FROM artworks WHERE type = $1 AND is_active = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [type, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM artworks WHERE type = $1 AND is_active = true',
      [type]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      artworks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get artworks by type error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to fetch artworks. Please try again.'
    });
  }
});

// Get artworks by artist
router.get('/artist/:artist', optionalAuth, async (req, res) => {
  try {
    const { artist } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      'SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at FROM artworks WHERE artist ILIKE $1 AND is_active = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [`%${artist}%`, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM artworks WHERE artist ILIKE $1 AND is_active = true',
      [`%${artist}%`]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      artworks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get artworks by artist error:', error);
    res.status(500).json({
      error: 'Failed to fetch artworks',
      message: 'Unable to fetch artworks. Please try again.'
    });
  }
});

// Create new artwork (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('artist').trim().isLength({ min: 1, max: 100 }).withMessage('Artist name is required and must be less than 100 characters'),
  body('type').isIn(['painting', 'sketch']).withMessage('Type must be either painting or sketch'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, artist, type, price, imageUrl, stockQuantity = 1 } = req.body;

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
      message: 'Unable to create artwork. Please try again.'
    });
  }
});

// Update artwork (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('artist').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Artist name must be less than 100 characters'),
  body('type').optional().isIn(['painting', 'sketch']).withMessage('Type must be either painting or sketch'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
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
    const { title, description, artist, type, price, imageUrl, stockQuantity } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (artist) {
      updates.push(`artist = $${paramCount++}`);
      values.push(artist);
    }
    if (type) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (price) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }
    if (stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(stockQuantity);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'At least one field must be provided for update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE artworks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, artist, type, price, image_url, stock_quantity, updated_at
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'Artwork not found'
      });
    }

    res.json({
      message: 'Artwork updated successfully',
      artwork: result.rows[0]
    });

  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Unable to update artwork. Please try again.'
    });
  }
});

// Soft delete artwork (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE artworks SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, title',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'Artwork not found'
      });
    }

    res.json({
      message: 'Artwork deleted successfully',
      artwork: {
        id: result.rows[0].id,
        title: result.rows[0].title
      }
    });

  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Unable to delete artwork. Please try again.'
    });
  }
});

// Search artworks
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    const searchQuery = `%${query}%`;
    
    const result = await pool.query(
      `SELECT id, title, description, artist, type, price, image_url, stock_quantity, created_at
       FROM artworks 
       WHERE is_active = true 
       AND (title ILIKE $1 OR description ILIKE $1 OR artist ILIKE $1)
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [searchQuery, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) 
       FROM artworks 
       WHERE is_active = true 
       AND (title ILIKE $1 OR description ILIKE $1 OR artist ILIKE $1)`,
      [searchQuery]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      artworks: result.rows,
      query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search artworks error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search artworks. Please try again.'
    });
  }
});

module.exports = router;
