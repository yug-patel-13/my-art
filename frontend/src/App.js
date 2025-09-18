import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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

function AppWrapper() {
  // AppWrapper is needed to use useNavigate
  const navigate = useNavigate();
  return <App navigate={navigate} />;
}

function App({ navigate }) {
  const [cart, setCart] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAuth = localStorage.getItem('isSignedIn');
    const token = localStorage.getItem('token');

    if (savedUser && savedAuth === 'true' && token) {
      validateToken(token).then(isValid => {
        if (isValid) {
          setUser(JSON.parse(savedUser));
          setIsSignedIn(true);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('isSignedIn');
          localStorage.removeItem('token');
        }
      });
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('https://my-artbackend-foy5.onrender.com/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const addToCart = (item) => {
    if (!isSignedIn) {
      const pendingCartItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
      pendingCartItems.push(item);
      localStorage.setItem('pendingCartItems', JSON.stringify(pendingCartItems));
      localStorage.setItem('cartIntent', 'true');
      navigate('/signin'); // use navigate instead of window.location.href
      return;
    }
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const buyNow = (item) => {
    navigateToCheckout([], true, item);
  };

  const navigateToCheckout = (cartItems, isBuyNow = false, singleItem = null) => {
    if (!isSignedIn) {
      localStorage.setItem('checkoutData', JSON.stringify({ cart: cartItems, isBuyNow, singleItem }));
      localStorage.setItem('checkoutIntent', 'true');
      navigate('/signin');
      return;
    }

    const state = { cart: cartItems, isBuyNow, singleItem };
    localStorage.setItem('checkoutData', JSON.stringify(state));
    navigate(`/checkout?state=${encodeURIComponent(JSON.stringify(state))}`);
  };

  const handleSignIn = (userData) => {
    setIsSignedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isSignedIn', 'true');

    const checkoutIntent = localStorage.getItem('checkoutIntent');
    if (checkoutIntent) {
      localStorage.removeItem('checkoutIntent');
      const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
      navigate(`/checkout?state=${encodeURIComponent(JSON.stringify(checkoutData))}`);
      return;
    }

    const cartIntent = localStorage.getItem('cartIntent');
    if (cartIntent) {
      localStorage.removeItem('cartIntent');
      const pendingCartItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
      if (pendingCartItems.length > 0) {
        setCart(prev => [...prev, ...pendingCartItems]);
        localStorage.removeItem('pendingCartItems');
        navigate('/cart');
        return;
      }
    }

    navigate('/');
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <Navbar isSignedIn={isSignedIn} user={user} onSignOut={handleSignOut} cartCount={cart.length} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paintings" element={<Paintings addToCart={addToCart} buyNow={buyNow} isSignedIn={isSignedIn} />} />
          <Route path="/sketches" element={<Sketches addToCart={addToCart} buyNow={buyNow} isSignedIn={isSignedIn} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} isSignedIn={isSignedIn} navigateToCheckout={navigateToCheckout} />} />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} isSignedIn={isSignedIn} />} />
          <Route path="/signup" element={<SignUp onSignIn={handleSignIn} isSignedIn={isSignedIn} />} />
          <Route path="/search" element={<Search addToCart={addToCart} buyNow={buyNow} isSignedIn={isSignedIn} />} />
          <Route path="/checkout" element={<Checkout isSignedIn={isSignedIn} user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Wrap App in Router with AppWrapper to use useNavigate
export default function RootApp() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
