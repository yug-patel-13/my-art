const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sketch-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Submit custom sketch request
router.post('/sketch', authenticateToken, upload.single('photo'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('size').isIn(['A5', 'A4', 'A3', 'A2']).withMessage('Size must be A5, A4, A3, or A2'),
  body('numberOfPersons').isInt({ min: 1, max: 10 }).withMessage('Number of persons must be 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, size, numberOfPersons } = req.body;
    const photoUrl = req.file ? req.file.filename : null;

    // Calculate price
    let basePrice = 700; // 1 person
    if (numberOfPersons === 2) basePrice = 1200;
    else if (numberOfPersons === 3) basePrice = 1600;
    else if (numberOfPersons > 3) basePrice = 1600 + ((numberOfPersons - 3) * 400);

    // Apply size multiplier
    const sizeMultipliers = { 'A5': 0.8, 'A4': 1.0, 'A3': 1.3, 'A2': 1.6 };
    const finalPrice = Math.round(basePrice * sizeMultipliers[size]);

    const result = await pool.query(`
      INSERT INTO custom_sketches (user_id, name, email, size, number_of_persons, photo_url, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, size, number_of_persons, photo_url, price, status, created_at
    `, [req.user.id, name, email, size, numberOfPersons, photoUrl, finalPrice]);

    const sketchData = result.rows[0];

    // Send email notification with photo attachment
    try {
      const photoPath = req.file ? path.join(__dirname, '..', 'uploads', req.file.filename) : null;
      await emailService.sendCustomSketchNotification({
        name: sketchData.name,
        email: sketchData.email,
        size: sketchData.size,
        numberOfPersons: sketchData.number_of_persons,
        price: sketchData.price
      }, photoPath);
      console.log('📧 Email notification sent for custom sketch order');
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Custom sketch request submitted successfully',
      sketch: {
        id: sketchData.id,
        name: sketchData.name,
        email: sketchData.email,
        size: sketchData.size,
        numberOfPersons: sketchData.number_of_persons,
        photoUrl: sketchData.photo_url,
        price: sketchData.price,
        status: sketchData.status,
        createdAt: sketchData.created_at
      }
    });

  } catch (error) {
    console.error('Submit custom sketch error:', error);
    res.status(500).json({
      error: 'Failed to submit sketch request',
      message: 'Unable to submit sketch request. Please try again.'
    });
  }
});

// Submit custom painting request
router.post('/painting', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, phone, description } = req.body;

    const result = await pool.query(`
      INSERT INTO custom_paintings (user_id, name, email, phone, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, description, status, created_at
    `, [req.user.id, name, email, phone, description]);

    const paintingData = result.rows[0];

    // Send email notification
    try {
      await emailService.sendCustomPaintingNotification({
        name: paintingData.name,
        email: paintingData.email,
        phone: paintingData.phone,
        description: paintingData.description
      });
      console.log('📧 Email notification sent for custom painting request');
    } catch (emailError) {
      console.error('❌ Failed to send email notification:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Custom painting request submitted successfully',
      painting: {
        id: paintingData.id,
        name: paintingData.name,
        email: paintingData.email,
        phone: paintingData.phone,
        description: paintingData.description,
        status: paintingData.status,
        createdAt: paintingData.created_at
      }
    });

  } catch (error) {
    console.error('Submit custom painting error:', error);
    res.status(500).json({
      error: 'Failed to submit painting request',
      message: 'Unable to submit painting request. Please try again.'
    });
  }
});

// Get user's custom sketches
router.get('/sketches', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT id, name, email, size, number_of_persons, photo_url, price, status, created_at
      FROM custom_sketches
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM custom_sketches WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      sketches: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get custom sketches error:', error);
    res.status(500).json({
      error: 'Failed to fetch sketches',
      message: 'Unable to fetch custom sketches. Please try again.'
    });
  }
});

// Get user's custom paintings
router.get('/paintings', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT id, name, email, phone, description, status, created_at
      FROM custom_paintings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM custom_paintings WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      paintings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get custom paintings error:', error);
    res.status(500).json({
      error: 'Failed to fetch paintings',
      message: 'Unable to fetch custom paintings. Please try again.'
    });
  }
});

// Get all custom sketches (admin only)
router.get('/admin/sketches', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT cs.id, cs.name, cs.email, cs.size, cs.number_of_persons, cs.photo_url, cs.price, cs.status, cs.created_at,
             u.first_name, u.last_name
      FROM custom_sketches cs
      JOIN users u ON cs.user_id = u.id
    `;
    
    let conditions = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`cs.status = $${paramCount++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY cs.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM custom_sketches cs';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      sketches: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all custom sketches error:', error);
    res.status(500).json({
      error: 'Failed to fetch sketches',
      message: 'Unable to fetch custom sketches. Please try again.'
    });
  }
});

// Get all custom paintings (admin only)
router.get('/admin/paintings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT cp.id, cp.name, cp.email, cp.phone, cp.description, cp.status, cp.created_at,
             u.first_name, u.last_name
      FROM custom_paintings cp
      JOIN users u ON cp.user_id = u.id
    `;
    
    let conditions = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`cp.status = $${paramCount++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY cp.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM custom_paintings cp';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      paintings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all custom paintings error:', error);
    res.status(500).json({
      error: 'Failed to fetch paintings',
      message: 'Unable to fetch custom paintings. Please try again.'
    });
  }
});

// Update custom sketch status (admin only)
router.put('/sketches/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
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
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE custom_sketches SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Custom sketch not found',
        message: 'Custom sketch not found'
      });
    }

    res.json({
      message: 'Custom sketch status updated successfully',
      sketch: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });

  } catch (error) {
    console.error('Update custom sketch status error:', error);
    res.status(500).json({
      error: 'Failed to update sketch status',
      message: 'Unable to update sketch status. Please try again.'
    });
  }
});

// Update custom painting status (admin only)
router.put('/paintings/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
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
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE custom_paintings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Custom painting not found',
        message: 'Custom painting not found'
      });
    }

    res.json({
      message: 'Custom painting status updated successfully',
      painting: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });

  } catch (error) {
    console.error('Update custom painting status error:', error);
    res.status(500).json({
      error: 'Failed to update painting status',
      message: 'Unable to update painting status. Please try again.'
    });
  }
});

// Get price preview for custom sketch
router.post('/sketch/price-preview', [
  body('size').isIn(['A5', 'A4', 'A3', 'A2']).withMessage('Size must be A5, A4, A3, or A2'),
  body('numberOfPersons').isInt({ min: 1, max: 10 }).withMessage('Number of persons must be 1-10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { size, numberOfPersons } = req.body;

    // Calculate price
    let basePrice = 700; // 1 person
    if (numberOfPersons === 2) basePrice = 1200;
    else if (numberOfPersons === 3) basePrice = 1600;
    else if (numberOfPersons > 3) basePrice = 1600 + ((numberOfPersons - 3) * 400);

    // Apply size multiplier
    const sizeMultipliers = { 'A5': 0.8, 'A4': 1.0, 'A3': 1.3, 'A2': 1.6 };
    const finalPrice = Math.round(basePrice * sizeMultipliers[size]);

    res.json({
      pricePreview: {
        size,
        numberOfPersons,
        basePrice,
        sizeMultiplier: sizeMultipliers[size],
        finalPrice
      }
    });

  } catch (error) {
    console.error('Price preview error:', error);
    res.status(500).json({
      error: 'Failed to calculate price',
      message: 'Unable to calculate price. Please try again.'
    });
  }
});

module.exports = router;