const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id as cart_id,
        c.quantity,
        a.id as artwork_id,
        a.title,
        a.artist,
        a.price,
        a.image_url,
        a.stock_quantity
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.user_id = $1 AND a.is_active = true
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    const cartItems = result.rows.map(item => ({
      id: item.cart_id,
      artworkId: item.artwork_id,
      title: item.title,
      artist: item.artist,
      price: parseFloat(item.price),
      imageUrl: item.image_url,
      quantity: item.quantity,
      stockQuantity: item.stock_quantity
    }));

    res.json({
      cart: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      message: 'Unable to retrieve cart items'
    });
  }
});

// Add item to cart
router.post('/', authenticateToken, [
  body('artworkId').isInt({ min: 1 }).withMessage('Valid artwork ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { artworkId, quantity } = req.body;
    const userId = req.user.id;

    // Check if artwork exists and is active
    const artworkResult = await pool.query(`
      SELECT id, title, price, stock_quantity FROM artworks 
      WHERE id = $1 AND is_active = true
    `, [artworkId]);

    if (artworkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'The requested artwork is not available'
      });
    }

    const artwork = artworkResult.rows[0];

    // Check stock availability
    if (artwork.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: `Only ${artwork.stock_quantity} items available for "${artwork.title}"`
      });
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(`
      SELECT id, quantity FROM cart 
      WHERE user_id = $1 AND artwork_id = $2
    `, [userId, artworkId]);

    if (existingItem.rows.length > 0) {
      // Update existing item
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      if (newQuantity > artwork.stock_quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Cannot add ${quantity} more items. Only ${artwork.stock_quantity - existingItem.rows[0].quantity} additional items available.`
        });
      }

      await pool.query(`
        UPDATE cart 
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newQuantity, existingItem.rows[0].id]);

      res.json({
        message: 'Cart updated successfully',
        cartItem: {
          id: existingItem.rows[0].id,
          artworkId: parseInt(artworkId),
          quantity: newQuantity
        }
      });
    } else {
      // Add new item to cart
      const result = await pool.query(`
        INSERT INTO cart (user_id, artwork_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING id, quantity
      `, [userId, artworkId, quantity]);

      res.status(201).json({
        message: 'Item added to cart successfully',
        cartItem: {
          id: result.rows[0].id,
          artworkId: parseInt(artworkId),
          quantity: result.rows[0].quantity
        }
      });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Failed to add to cart',
      message: 'Unable to add item to cart'
    });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, [
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
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
    const { quantity } = req.body;
    const userId = req.user.id;

    // Check if cart item exists and belongs to user
    const cartItem = await pool.query(`
      SELECT c.id, c.artwork_id, c.quantity, a.title, a.stock_quantity
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.id = $1 AND c.user_id = $2
    `, [id, userId]);

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      });
    }

    const item = cartItem.rows[0];

    // Check stock availability
    if (item.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: `Only ${item.stock_quantity} items available for "${item.title}"`
      });
    }

    // Update quantity
    await pool.query(`
      UPDATE cart 
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [quantity, id]);

    res.json({
      message: 'Cart item updated successfully',
      cartItem: {
        id: parseInt(id),
        artworkId: item.artwork_id,
        quantity: quantity
      }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      error: 'Failed to update cart',
      message: 'Unable to update cart item'
    });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if cart item exists and belongs to user
    const result = await pool.query(`
      DELETE FROM cart 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'The requested cart item does not exist'
      });
    }

    res.json({
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Failed to remove from cart',
      message: 'Unable to remove item from cart'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    res.json({
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: 'Unable to clear cart'
    });
  }
});

// Get cart summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as item_count,
        SUM(c.quantity) as total_quantity,
        SUM(c.quantity * a.price) as total_amount
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.user_id = $1 AND a.is_active = true
    `, [req.user.id]);

    const summary = result.rows[0];

    res.json({
      itemCount: parseInt(summary.item_count) || 0,
      totalQuantity: parseInt(summary.total_quantity) || 0,
      totalAmount: parseFloat(summary.total_amount) || 0
    });

  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch cart summary',
      message: 'Unable to retrieve cart summary'
    });
  }
});

module.exports = router;