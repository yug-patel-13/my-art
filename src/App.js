import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Paintings from './components/Paintings';
import Sketches from './components/Sketches';
import Cart from './components/Cart';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Search from './components/Search';
import Checkout from './components/Checkout';
import Footer from './components/Footer';

function App() {
  const [cart, setCart] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Load authentication state from localStorage on app start
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isSignedIn');
    const token = localStorage.getItem('token');
    
    if (savedUser && savedAuth === 'true' && token) {
      // Validate token with backend
      validateToken(token).then(isValid => {
        if (isValid) {
          try {
            setUser(JSON.parse(savedUser));
            setIsSignedIn(true);
            console.log('User authentication restored from localStorage');
          } catch (error) {
            console.error('Error restoring user authentication:', error);
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('isSignedIn');
            localStorage.removeItem('token');
          }
        } else {
          // Token is invalid, clear authentication
          localStorage.removeItem('user');
          localStorage.removeItem('isSignedIn');
          localStorage.removeItem('token');
          console.log('Invalid token, authentication cleared');
        }
      });
    }
  }, []);

  // Function to validate JWT token with backend
  const validateToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('🔍 Token validation response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const addToCart = (item) => {
    if (!isSignedIn) {
      // Store the item to add to cart after signin
      try {
        const pendingCartItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
        pendingCartItems.push(item);
        localStorage.setItem('pendingCartItems', JSON.stringify(pendingCartItems));
        localStorage.setItem('cartIntent', 'true');
        console.log('Cart intent stored, redirecting to signin');
      } catch (error) {
        console.error('Error storing cart intent:', error);
      }
      
      // Redirect to signin page
      window.location.href = '/signin';
      return;
    }
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const buyNow = (item) => {
    console.log('🛒 buyNow called with item:', item);
    console.log('🔐 Current isSignedIn state:', isSignedIn);
    console.log('👤 Current user:', user);
    
    // Go directly to checkout page (like Flipkart)
    // User can sign in during checkout if needed
    const state = { cart: [], isBuyNow: true, singleItem: item };
    
    // Store data in localStorage
    try {
      localStorage.setItem('checkoutData', JSON.stringify(state));
      console.log('📦 Checkout data stored for Buy Now:', state);
    } catch (error) {
      console.error('Error storing checkout data:', error);
    }
    
    // Navigate directly to checkout
    const url = `/checkout?state=${encodeURIComponent(JSON.stringify(state))}`;
    console.log('🚀 Navigating directly to checkout URL:', url);
    window.location.href = url;
  };

  const navigateToCheckout = (cartItems, isBuyNow = false, singleItem = null) => {
    console.log('🛒 navigateToCheckout called with:', { cartItems, isBuyNow, singleItem, isSignedIn });
    
    // Check if user is signed in
    if (!isSignedIn) {
      console.log('❌ User not signed in, storing checkout intent...');
      // Store checkout intent and data
      const state = { cart: cartItems, isBuyNow, singleItem };
      try {
        localStorage.setItem('checkoutData', JSON.stringify(state));
        localStorage.setItem('checkoutIntent', 'true');
        console.log('✅ Checkout intent stored, redirecting to signin');
        console.log('📦 Stored checkout data:', state);
      } catch (error) {
        console.error('Error storing checkout intent:', error);
      }
      
      // Redirect to signin page
      console.log('🔄 Redirecting to signin page...');
      window.location.href = '/signin';
      return;
    }
    
    // User is signed in, proceed to checkout
    console.log('✅ User is signed in, proceeding to checkout...');
    const state = { cart: cartItems, isBuyNow, singleItem };
    
    // Store data in localStorage as backup
    try {
      localStorage.setItem('checkoutData', JSON.stringify(state));
      console.log('📦 Checkout data stored in localStorage:', state);
    } catch (error) {
      console.error('Error storing checkout data:', error);
    }
    
    // Navigate to checkout with state in URL
    const url = `/checkout?state=${encodeURIComponent(JSON.stringify(state))}`;
    console.log('🚀 Navigating to checkout URL:', url);
    
    // Use window.location.href for now since we're outside Router context
    // This will cause a page refresh, but localStorage will preserve the data
    window.location.href = url;
  };

  const handleSignIn = (userData) => {
    console.log('🔐 handleSignIn called with:', userData);
    setIsSignedIn(true);
    setUser(userData);
    
    // Persist authentication state to localStorage
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isSignedIn', 'true');
      console.log('✅ User authentication saved to localStorage');
    } catch (error) {
      console.error('Error saving user authentication:', error);
    }
    
    // Check if user was trying to checkout before signing in
    const checkoutIntent = localStorage.getItem('checkoutIntent');
    console.log('🔍 Checking checkout intent:', checkoutIntent);
    
    if (checkoutIntent) {
      console.log('🎯 User has checkout intent, redirecting to checkout...');
      // Clear the intent
      localStorage.removeItem('checkoutIntent');
      
      // Redirect to checkout with the stored data
      const checkoutData = localStorage.getItem('checkoutData');
      console.log('📦 Checkout data:', checkoutData);
      
      if (checkoutData) {
        try {
          const state = JSON.parse(checkoutData);
          const url = `/checkout?state=${encodeURIComponent(JSON.stringify(state))}`;
          console.log('🚀 Redirecting to checkout URL:', url);
          window.location.href = url;
          return;
        } catch (error) {
          console.error('Error parsing checkout data:', error);
        }
      }
    }
    
    // Check if user was trying to add items to cart
    const cartIntent = localStorage.getItem('cartIntent');
    if (cartIntent) {
      // Clear the intent
      localStorage.removeItem('cartIntent');
      
      // Add pending items to cart
      const pendingCartItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
      if (pendingCartItems.length > 0) {
        setCart(prevCart => [...prevCart, ...pendingCartItems]);
        localStorage.removeItem('pendingCartItems');
        
        // Redirect to cart page
        window.location.href = '/cart';
        return;
      }
    }
    
    // Default redirect to home if no intent
    window.location.href = '/';
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    setCart([]);
    
    // Clear authentication data from localStorage
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('isSignedIn');
      localStorage.removeItem('token'); // Clear JWT token
      console.log('User authentication and JWT token cleared from localStorage');
    } catch (error) {
      console.error('Error clearing user authentication:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          isSignedIn={isSignedIn} 
          user={user} 
          onSignOut={handleSignOut}
          cartCount={cart.length}
        />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paintings" element={
              <Paintings 
                addToCart={addToCart} 
                buyNow={buyNow}
                isSignedIn={isSignedIn}
              />
            } />
            <Route path="/sketches" element={
              <Sketches 
                addToCart={addToCart} 
                buyNow={buyNow}
                isSignedIn={isSignedIn}
              />
            } />
            <Route path="/cart" element={
              <Cart 
                cart={cart} 
                removeFromCart={removeFromCart}
                isSignedIn={isSignedIn}
                navigateToCheckout={navigateToCheckout}
              />
            } />
            <Route path="/signin" element={
              <SignIn 
                onSignIn={handleSignIn}
                isSignedIn={isSignedIn}
              />
            } />
            <Route path="/signup" element={
              <SignUp 
                onSignIn={handleSignIn}
                isSignedIn={isSignedIn}
              />
            } />
            <Route path="/search" element={
              <Search 
                addToCart={addToCart}
                buyNow={buyNow}
                isSignedIn={isSignedIn}
              />
            } />
            <Route path="/checkout" element={
              <Checkout 
                isSignedIn={isSignedIn}
                user={user}
              />
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
