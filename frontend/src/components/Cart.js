import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, removeFromCart, isSignedIn, navigateToCheckout }) => {
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigateToCheckout(cart, false, null);
  };

  if (!isSignedIn) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Please Sign In</h2>
          <p>You need to be signed in to view your cart.</p>
          <Link to="/signin" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Start shopping to add beautiful artworks to your cart!</p>
          <div className="cart-actions">
            <Link to="/paintings" className="btn btn-primary">Browse Paintings</Link>
            <Link to="/sketches" className="btn btn-secondary">View Sketches</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>You have {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={`${item.id}-${index}`} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="item-details">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-artist">by {item.artist}</p>
                <p className="item-type">{item.type === 'painting' ? 'Painting' : 'Sketch'}</p>
                <p className="item-medium">{item.medium}</p>
                <p className="item-size">{item.size}</p>
                <div className="item-price">₹{item.price.toLocaleString()}</div>
              </div>
              <div className="item-actions">
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{calculateTotal().toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{calculateTotal().toLocaleString()}</span>
          </div>
          
          <button 
            className="btn btn-primary checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
          
          <div className="cart-continue">
            <Link to="/paintings" className="link">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
