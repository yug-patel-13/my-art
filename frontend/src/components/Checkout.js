import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Checkout.css';

const Checkout = ({ isSignedIn, user }) => {

  const gujaratDistricts = [
  "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", 
  "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka",
  "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch",
  "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
  "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
  "Tapi", "Vadodara", "Valsad"
];

  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('Checkout component rendered with props:', { isSignedIn, user });
  console.log('Location:', location);
  
  // Parse URL parameters to get cart data
  const urlParams = new URLSearchParams(location.search);
  const stateParam = urlParams.get('state');
  
  // Use useMemo to prevent cart from changing on every render
  const { cart, isBuyNow, singleItem } = React.useMemo(() => {
    let cartData = [];
    let isBuyNowData = false;
    let singleItemData = null;
    
    // Try to get data from URL parameters first
    if (stateParam) {
      try {
        const state = JSON.parse(decodeURIComponent(stateParam));
        cartData = state.cart || [];
        isBuyNowData = state.isBuyNow || false;
        singleItemData = state.singleItem || null;
        console.log('Checkout data loaded from URL:', { cartData, isBuyNowData, singleItemData });
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }
    
    // If no data from URL, try to get from localStorage (fallback)
    if (cartData.length === 0 && !singleItemData) {
      try {
        const storedData = localStorage.getItem('checkoutData');
        if (storedData) {
          const state = JSON.parse(storedData);
          cartData = state.cart || [];
          isBuyNowData = state.isBuyNow || false;
          singleItemData = state.singleItem || null;
          console.log('Checkout data loaded from localStorage:', { cartData, isBuyNowData, singleItemData });
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
    
    console.log('Final checkout data:', { cartData, isBuyNowData, singleItemData });
    return { cart: cartData, isBuyNow: isBuyNowData, singleItem: singleItemData };
  }, [stateParam]);

  // Simple test - if this shows up, the component is loading
  console.log('Checkout component is loading...');

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [paymentDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: false
  });

  const [orderSummary, setOrderSummary] = useState([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Update orderSummary when cart data changes
  useEffect(() => {
    if (isBuyNow && singleItem) {
      setOrderSummary([singleItem]);
    } else if (cart && cart.length > 0) {
      setOrderSummary(cart);
    }
  }, [isBuyNow, singleItem, cart]);

  const calculateSubtotal = () => {
    return orderSummary.reduce((total, item) => total + item.price, 0);
  };

  const calculateShipping = () => {
    // Add delivery fee for Cash on Delivery
    if (paymentMethod === 'cashOnDelivery') {
      return 5.00;
    }
    return 0; // Free shipping for other payment methods
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleAddressChange = (field, value, addressType = 'shipping') => {
    if (addressType === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
      if (billingAddress.sameAsShipping) {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingAddressToggle = () => {
    setBillingAddress(prev => ({ ...prev, sameAsShipping: !prev.sameAsShipping }));
  };



  const validateStep = (step) => {
    switch (step) {
      case 1:
        return shippingAddress.firstName && shippingAddress.lastName && 
               shippingAddress.email && shippingAddress.phone && 
               shippingAddress.address && shippingAddress.city && 
               shippingAddress.state && shippingAddress.zipCode;
      case 2:
        if (billingAddress.sameAsShipping) return true;
        return billingAddress.firstName && billingAddress.lastName && 
               billingAddress.address && billingAddress.city && 
               billingAddress.state && billingAddress.zipCode;
      case 3:
        if (paymentMethod === 'creditCard') {
          return paymentDetails.cardNumber && paymentDetails.cardholderName && 
                 paymentDetails.expiryMonth && paymentDetails.expiryYear && 
                 paymentDetails.cvv;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    try {
      console.log('🛒 Placing order...');
      console.log('Order data:', {
        shippingAddress,
        paymentMethod,
        orderSummary,
        isSignedIn,
        user
      });

      // Prepare order data (matching backend expectations)
      const orderData = {
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          street: shippingAddress.address, // Backend expects 'street' not 'address'
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country
        },
        paymentMethod: paymentMethod === 'cashOnDelivery' ? 'cod' : paymentMethod, // Convert to backend format
        items: orderSummary.map(item => ({
          artworkId: item.id,
          title: item.title,
          artist: item.artist,
          price: item.price,
          quantity: item.quantity || 1
        }))
      };

      // Send order to backend
      const response = await fetch('https://my-artbackend-foy5.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      console.log('✅ Order placed successfully:', result);
      
      // Show order confirmation animation
      setOrderConfirmed(true);
      
      // Navigate to home after showing confirmation
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('❌ Order placement failed:', error);
      alert('Failed to place order: ' + error.message);
    }
  };

  // Allow guest checkout (like Flipkart)
  // User can sign in during checkout if they want
  // if (!isSignedIn) {
  //   navigate('/signin');
  //   return null;
  // }

  // Debug: Log current state
  console.log('Checkout component state:', {
    isSignedIn,
    user,
    cart,
    isBuyNow,
    singleItem,
    orderSummary
  });

  // If no items to checkout, show a message instead of redirecting
  if (orderSummary.length === 0) {
    console.log('No items to checkout, showing empty state');
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>No items found to checkout</p>
          </div>
          <div className="checkout-content">
            <div className="checkout-main">
              <div className="checkout-step">
                <h2>No Items</h2>
                <p>Please add items to your cart or select an item to buy now.</p>
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginRight: '1rem' }}>
                    Continue Shopping
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/paintings')}>
                    Browse Paintings
                  </button>
                </div>
               
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
                  <h3>Test Checkout (Remove after testing)</h3>
                  <p>Click the button below to test checkout with sample data:</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      const sampleItem = {
                        id: 1,
                        title: "Test Painting",
                        artist: "Test Artist",
                        price: 1000,
                        medium: "Oil on Canvas",
                        size: "24\" x 36\"",
                        image: "/images/paintings/p1.jpeg",
                        description: "This is a test item for checkout testing.",
                        type: 'painting'
                      };
                      setOrderSummary([sampleItem]);
                    }}
                  >
                    Load Test Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show order confirmation overlay
  if (orderConfirmed) {
    return (
      <div className="order-confirmation-overlay">
        <div className="confirmation-content">
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark">✓</div>
            </div>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
          <div className="order-details">
            <p><strong>Order ID:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p><strong>Payment Method:</strong> {paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Card Payment'}</p>
            <p><strong>Total Amount:</strong> ₹{calculateTotal().toFixed(2)}</p>
          </div>
          <div className="confirmation-message">
            {paymentMethod === 'cashOnDelivery' ? (
              <p>Your order will be delivered within 3-5 business days. Please have the exact amount ready for payment.</p>
            ) : (
              <p>Your order will be delivered within 3-5 business days. Payment has been processed successfully.</p>
            )}
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Debug Section - Remove this after testing */}
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '2rem' 
        }}>
 
         
        </div>
        
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase</p>
          <div className="checkout-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-title">Shipping Address</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-title">Billing Address</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-title">Payment</span>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-title">Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="checkout-step">
                <h2>Shipping Address</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      placeholder="Street address, P.O. box, company name"
                      required
                    />
                  </div>
                 <div className="form-group">
  <label>City (District of Gujarat) *</label>
  <select
    value={shippingAddress.city}
    onChange={(e) => handleAddressChange('city', e.target.value)}
    required
  >
    <option value="">Select District</option>
    {gujaratDistricts.map((district, index) => (
      <option key={index} value={district}>{district}</option>
    ))}
  </select>
</div>

                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value="Gujrat"
                    
                      required
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                    >
                      <option value="India">India</option>
                    
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Billing Address */}
            {currentStep === 2 && (
              <div className="checkout-step">
                <h2>Billing Address</h2>
                <div className="billing-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={billingAddress.sameAsShipping}
                      onChange={handleBillingAddressToggle}
                    />
                    Same as shipping address
                  </label>
                </div>
                
                {!billingAddress.sameAsShipping && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={billingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value, 'billing')}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={billingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value, 'billing')}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address *</label>
                      <input
                        type="text"
                        value={billingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value, 'billing')}
                        required
                      />
                    </div>
        <div className="form-group">
  <label>City (District of Gujarat) *</label>
  <select
    value={billingAddress.city}
    onChange={(e) => handleAddressChange('city', e.target.value, 'billing')}
    required
  >
    <option value="">Select District</option>
    {gujaratDistricts.map((district, index) => (
      <option key={index} value={district}>{district}</option>
    ))}
  </select>
</div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value="Gujrat"
                       disabled
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        value={billingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value, 'billing')}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <select
                        value={billingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value, 'billing')}
                      >
                        <option value="India">India</option>
                      
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment Method */}
          {currentStep === 3 && (
  <div className="checkout-step">
    <h2>Payment Method</h2>
    <div className="payment-options">
      <div className="payment-option">
        <input
          type="radio"
          id="cashOnDelivery"
          name="paymentMethod"
          value="cashOnDelivery"
          checked={paymentMethod === 'cashOnDelivery'}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        <label htmlFor="cashOnDelivery">Cash on Delivery</label>
      </div>

      <div className="payment-option">
        <input
          type="radio"
          id="creditCard"
          name="paymentMethod"
          value="creditCard"
          checked={paymentMethod === 'creditCard'}
          disabled
        />
        <label htmlFor="creditCard" style={{ opacity: 0.5 }}>Credit Card (Disabled)</label>
      </div>

      <div className="payment-option">
        <input
          type="radio"
          id="debitCard"
          name="paymentMethod"
          value="debitCard"
          checked={paymentMethod === 'debitCard'}
          disabled
        />
        <label htmlFor="debitCard" style={{ opacity: 0.5 }}>Debit Card (Disabled)</label>
      </div>

      <div className="payment-option">
        <input
          type="radio"
          id="paypal"
          name="paymentMethod"
          value="paypal"
          checked={paymentMethod === 'paypal'}
          disabled
        />
        <label htmlFor="paypal" style={{ opacity: 0.5 }}>PayPal (Disabled)</label>
      </div>
    </div>

    {/* Show only COD details */}
    {paymentMethod === 'cashOnDelivery' && (
      <div className="cod-info">
        <div className="cod-logo">
          <span>💵</span>
        </div>
        <h3>Cash on Delivery</h3>
        <p>Pay with cash when your order is delivered.</p>
        <div className="cod-details">
          <p><strong>Delivery Fee:</strong> ₹415</p>
          <p><strong>Payment:</strong> Cash only</p>
          <p><strong>Note:</strong> Please have exact change ready</p>
        </div>
      </div>
    )}
  </div>
)}

            {/* Step 4: Review Order */}
            {currentStep === 4 && (
              <div className="checkout-step">
                <h2>Review Your Order</h2>
                <div className="review-section">
                  <h3>Shipping Address</h3>
                  <div className="address-display">
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    <p>{shippingAddress.country}</p>
                    <p>Phone: {shippingAddress.phone}</p>
                    <p>Email: {shippingAddress.email}</p>
                  </div>
                </div>

                <div className="review-section">
                  <h3>Billing Address</h3>
                  <div className="address-display">
                    {billingAddress.sameAsShipping ? (
                      <p>Same as shipping address</p>
                    ) : (
                      <>
                        <p>{billingAddress.firstName} {billingAddress.lastName}</p>
                        <p>{billingAddress.address}</p>
                        <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}</p>
                        <p>{billingAddress.country}</p>
                      </>
                    )}
                  </div>
                </div>

                                 <div className="review-section">
                   <h3>Payment Method</h3>
                   <div className="payment-display">
                     <p>{paymentMethod === 'creditCard' ? 'Credit Card' : 
                         paymentMethod === 'debitCard' ? 'Debit Card' : 
                         paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p>
                     {paymentMethod === 'creditCard' || paymentMethod === 'debitCard' ? (
                       <p>Card ending in {paymentDetails.cardNumber.slice(-4)}</p>
                     ) : paymentMethod === 'cashOnDelivery' ? (
                       <p>Pay with cash upon delivery</p>
                     ) : null}
                   </div>
                 </div>

                <div className="review-section">
                  <h3>Order Items</h3>
                  <div className="order-items">
                    {orderSummary.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image} alt={item.title} />
                        <div className="item-details">
                          <h4>{item.title}</h4>
                          <p>by {item.artist}</p>
                          <p className="item-price">RS.{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="checkout-actions">
              {currentStep > 1 && (
                <button className="btn btn-secondary" onClick={prevStep}>
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  Continue
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              )}
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {orderSummary.map((item, index) => (
                  <div key={index} className="summary-item">
                    <img src={item.image} alt={item.title} />
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>by {item.artist}</p>
                    </div>
                    <span className="item-price">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
                             <div className="summary-totals">
                 <div className="summary-row">
                   <span>Subtotal:</span>
                   <span>₹{calculateSubtotal().toLocaleString()}</span>
                 </div>
                 <div className="summary-row">
                   <span>Shipping:</span>
                   <span>{paymentMethod === 'cashOnDelivery' ? '₹415' : 'Free'}</span>
                 </div>
                 <div className="summary-row"> 
                   <span>Tax:</span>
                   <span>₹{calculateTax().toFixed(2)}</span>
                 </div>
                 <div className="summary-row total">
                   <span>Total:</span>
                   <span>₹{calculateTotal().toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


