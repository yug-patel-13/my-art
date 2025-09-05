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
        c.created_at as added_at,
        a.id as artwork_id,
        a.title,
        a.description,
        a.artist,
        a.type,
        a.price,
        a.image_url,
        a.stock_quantity
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.user_id = $1 AND a.is_active = true
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    res.json({
      cart: result.rows
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      message: 'Unable to fetch cart items. Please try again.'
    });
  }
});

// Add item to cart
router.post('/', authenticateToken, [
  body('artworkId').isInt({ min: 1 }).withMessage('Valid artwork ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    // Check if artwork exists and is active
    const artworkResult = await pool.query(
      'SELECT id, title, price, stock_quantity FROM artworks WHERE id = $1 AND is_active = true',
      [artworkId]
    );

    if (artworkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Artwork not found',
        message: 'Artwork not found or no longer available'
      });
    }

    const artwork = artworkResult.rows[0];

    // Check stock availability
    if (artwork.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: `Only ${artwork.stock_quantity} items available in stock`
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND artwork_id = $2',
      [req.user.id, artworkId]
    );

    if (existingCartItem.rows.length > 0) {
      // Update existing cart item
      const newQuantity = existingCartItem.rows[0].quantity + quantity;
      
      if (artwork.stock_quantity < newQuantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Cannot add ${quantity} more items. Only ${artwork.stock_quantity - existingCartItem.rows[0].quantity} additional items available`
        });
      }

      await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingCartItem.rows[0].id]
      );

      res.json({
        message: 'Cart updated successfully',
        cartItem: {
          cartId: existingCartItem.rows[0].id,
          artworkId: parseInt(artworkId),
          quantity: newQuantity,
          title: artwork.title,
          price: artwork.price
        }
      });
    } else {
      // Add new item to cart
      const result = await pool.query(`
        INSERT INTO cart (user_id, artwork_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING id, quantity, created_at
      `, [req.user.id, artworkId, quantity]);

      res.status(201).json({
        message: 'Item added to cart successfully',
        cartItem: {
          cartId: result.rows[0].id,
          artworkId: parseInt(artworkId),
          quantity: result.rows[0].quantity,
          title: artwork.title,
          price: artwork.price,
          addedAt: result.rows[0].created_at
        }
      });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Failed to add to cart',
      message: 'Unable to add item to cart. Please try again.'
    });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    // Get cart item with artwork details
    const cartItemResult = await pool.query(`
      SELECT c.id, c.artwork_id, c.quantity, a.stock_quantity, a.title
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.id = $1 AND c.user_id = $2 AND a.is_active = true
    `, [id, req.user.id]);

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'Cart item not found'
      });
    }

    const cartItem = cartItemResult.rows[0];

    // Check stock availability
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: `Only ${cartItem.stock_quantity} items available in stock`
      });
    }

    // Update quantity
    const result = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, quantity',
      [quantity, id]
    );

    res.json({
      message: 'Cart item updated successfully',
      cartItem: {
        cartId: result.rows[0].id,
        artworkId: cartItem.artwork_id,
        quantity: result.rows[0].quantity,
        title: cartItem.title
      }
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      error: 'Failed to update cart item',
      message: 'Unable to update cart item. Please try again.'
    });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cart item not found',
        message: 'Cart item not found'
      });
    }

    res.json({
      message: 'Item removed from cart successfully',
      cartItemId: result.rows[0].id
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Failed to remove from cart',
      message: 'Unable to remove item from cart. Please try again.'
    });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 RETURNING COUNT(*) as deleted_count',
      [req.user.id]
    );

    const deletedCount = parseInt(result.rows[0].deleted_count);

    res.json({
      message: 'Cart cleared successfully',
      deletedItems: deletedCount
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: 'Unable to clear cart. Please try again.'
    });
  }
});

// Get cart summary (total items and price)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(c.quantity) as total_quantity,
        SUM(c.quantity * a.price) as total_price
      FROM cart c
      JOIN artworks a ON c.artwork_id = a.id
      WHERE c.user_id = $1 AND a.is_active = true
    `, [req.user.id]);

    const summary = result.rows[0];
    
    res.json({
      summary: {
        totalItems: parseInt(summary.total_items) || 0,
        totalQuantity: parseInt(summary.total_quantity) || 0,
        totalPrice: parseFloat(summary.total_price) || 0
      }
    });

  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch cart summary',
      message: 'Unable to fetch cart summary. Please try again.'
    });
  }
});

module.exports = router;
