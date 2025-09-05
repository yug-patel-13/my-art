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

module.exports = router;