const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    let query = `
      SELECT id, first_name, last_name, email, phone, role, is_active, created_at
      FROM users 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    // Add filters
    if (role) {
      query += ` AND role = $${paramCount++}`;
      queryParams.push(role);
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount++} OR last_name ILIKE $${paramCount++} OR email ILIKE $${paramCount++})`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (role) {
      countQuery += ` AND role = $${countParamCount++}`;
      countParams.push(role);
    }

    if (search) {
      countQuery += ` AND (first_name ILIKE $${countParamCount++} OR last_name ILIKE $${countParamCount++} OR email ILIKE $${countParamCount++})`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Unable to retrieve users'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT id, first_name, last_name, email, phone, role, is_active, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'Unable to retrieve user'
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Role must be customer or admin')
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
    const allowedFields = ['firstName', 'lastName', 'phone', 'role'];
    
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key === 'firstName' ? 'first_name' : key === 'lastName' ? 'last_name' : key;
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
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, first_name, last_name, email, phone, role, is_active, updated_at
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const user = result.rows[0];
    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'Unable to update user'
    });
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, first_name, last_name, email, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      message: 'User deactivated successfully',
      user: {
        id: result.rows[0].id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        isActive: result.rows[0].is_active
      }
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'Failed to deactivate user',
      message: 'Unable to deactivate user'
    });
  }
});

// Reactivate user (admin only)
router.put('/:id/reactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, first_name, last_name, email, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      message: 'User reactivated successfully',
      user: {
        id: result.rows[0].id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        isActive: result.rows[0].is_active
      }
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      error: 'Failed to reactivate user',
      message: 'Unable to reactivate user'
    });
  }
});

// Change user role (admin only)
router.put('/:id/role', authenticateToken, requireAdmin, [
  body('role').isIn(['customer', 'admin']).withMessage('Role must be customer or admin')
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
    const { role } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name, email, role
    `, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: result.rows[0].id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        role: result.rows[0].role
      }
    });

  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      error: 'Failed to change user role',
      message: 'Unable to change user role'
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    
    // Get active users
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true');
    
    // Get users by role
    const usersByRole = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    
    // Get new users this month
    const newUsersThisMonth = await pool.query(`
      SELECT COUNT(*) 
      FROM users 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      usersByRole: usersByRole.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {}),
      newUsersThisMonth: parseInt(newUsersThisMonth.rows[0].count)
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'Unable to retrieve user statistics'
    });
  }
});

module.exports = router;