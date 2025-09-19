const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create order from cart (allow guest checkout)
router.post('/', [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('shippingAddress.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('shippingAddress.state').trim().isLength({ min: 1 }).withMessage('State is required'),
  body('shippingAddress.zipCode').trim().isLength({ min: 1 }).withMessage('ZIP code is required'),
  body('shippingAddress.country').trim().isLength({ min: 1 }).withMessage('Country is required'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cod']).withMessage('Valid payment method is required')
], async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { shippingAddress, paymentMethod, items } = req.body;

    await client.query('BEGIN');

    // Handle guest checkout or authenticated user
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }

    // Get items from request (for guest checkout) or from cart (for authenticated users)
    let orderItems = [];
    
    if (items && items.length > 0) {
      // Guest checkout - use items from request
      orderItems = items;
    } else if (userId) {
      // Authenticated user - get from cart
      const cartResult = await client.query(`
        SELECT 
          c.id as cart_id,
          c.quantity,
          a.id as artwork_id,
          a.title,
          a.price,
          a.stock_quantity
        FROM cart c
        JOIN artworks a ON c.artwork_id = a.id
        WHERE c.user_id = $1 AND a.is_active = true
      `, [userId]);
      
      orderItems = cartResult.rows.map(item => ({
        artworkId: item.artwork_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      }));
    }

    if (orderItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Empty order',
        message: 'No items to order'
      });
    }

    // Check stock availability and calculate total
    let totalAmount = 0;
    const processedOrderItems = [];

    for (const item of orderItems) {
      // For guest checkout, we'll skip stock check for now
      // In production, you'd want to verify stock availability
      
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      processedOrderItems.push({
        artworkId: item.artworkId,
        quantity: item.quantity,
        price: item.price,
        title: item.title
      });
    }

    // Add delivery fee for COD
    const deliveryFee = paymentMethod === 'cod' ? 415 : 0;
    totalAmount += deliveryFee;

    // Generate order number
    const orderNumber = `ART-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order (allow null user_id for guest checkout)
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, order_number, total_amount, status, created_at
    `, [userId, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod, 'pending']);

    const order = orderResult.rows[0];

    // Create order items
    for (const item of processedOrderItems) {
      // Insert order item
     await client.query(`
  INSERT INTO order_items (order_id, artwork_id, quantity, price, title)
  VALUES ($1, $2, $3, $4, $5)
`, [order.id, item.artworkId, item.quantity, item.price, item.title]);


      // Update stock (skip for guest checkout for now)
      if (userId) {
        await client.query(`
          UPDATE artworks 
          SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [item.quantity, item.artworkId]);
      }
    }

    // Clear cart (only for authenticated users)
    if (userId) {
      await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
        paymentMethod,
        deliveryFee,
        createdAt: order.created_at,
        items: orderItems
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: 'Unable to create order. Please try again.'
    });
  } finally {
    client.release();
  }
});

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, order_number, status, total_amount, payment_method, payment_status, created_at
      FROM orders 
      WHERE user_id = $1
    `;
    
    let conditions = ['user_id = $1'];
    let values = [req.user.id];
    let paramCount = 2;

    if (status) {
      conditions.push(`status = $${paramCount++}`);
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders WHERE user_id = $1';
    if (status) {
      countQuery += ' AND status = $2';
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'Unable to fetch orders. Please try again.'
    });
  }
});

// Get single order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details
    const orderResult = await pool.query(`
      SELECT id, order_number, status, total_amount, shipping_address, payment_method, payment_status, created_at, updated_at
      FROM orders 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(`
SELECT 
  oi.quantity,
  oi.price,
  oi.title,   
  a.id as artwork_id,
  a.artist,
  a.type,
  a.image_url
FROM order_items oi
JOIN artworks a ON oi.artwork_id = a.id
WHERE oi.order_id = $1

    `, [id]);

    res.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      error: 'Failed to fetch order details',
      message: 'Unable to fetch order details. Please try again.'
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
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
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, order_number, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: result.rows[0].id,
        orderNumber: result.rows[0].order_number,
        status: result.rows[0].status
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'Unable to update order status. Please try again.'
    });
  }
});

// Cancel order (user can cancel pending orders)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');

    // Get order details
    const orderResult = await client.query(`
      SELECT id, status, user_id
      FROM orders 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Cannot cancel order',
        message: 'Only pending orders can be cancelled'
      });
    }

    // Get order items to restore stock
    const itemsResult = await client.query(`
      SELECT artwork_id, quantity
      FROM order_items
      WHERE order_id = $1
    `, [id]);

    // Restore stock
    for (const item of itemsResult.rows) {
      await client.query(`
        UPDATE artworks 
        SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [item.quantity, item.artwork_id]);
    }

    // Update order status
    await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: order.id,
        status: 'cancelled'
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: 'Unable to cancel order. Please try again.'
    });
  } finally {
    client.release();
  }
});

module.exports = router;