import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaHome, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme, onOpenCart }) => {
  const location = useLocation();
  const { count } = useCart();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌱</span>
          Urban Harvest Hub
        </Link>
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
            aria-current={location.pathname === '/' ? 'page' : undefined}
          >
            <FaHome aria-hidden="true" />
            <span className="nav-text">Home</span>
          </Link>
          <Link 
            to="/workshops" 
            className={location.pathname.startsWith('/workshops') ? 'active' : ''}
          >
            Workshops
          </Link>
          <Link 
            to="/products" 
            className={location.pathname.startsWith('/products') ? 'active' : ''}
          >
            Products
          </Link>
          <Link 
            to="/events" 
            className={location.pathname.startsWith('/events') ? 'active' : ''}
          >
            Events
          </Link>
          {typeof onOpenCart === 'function' && (
            <button
              type="button"
              className="navbar-cart"
              onClick={onOpenCart}
              aria-label={`Shopping bag${count > 0 ? `, ${count} items` : ''}`}
            >
              <FaShoppingBag aria-hidden="true" />
              {count > 0 && <span className="navbar-cart__count">{count}</span>}
            </button>
          )}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <Link 
            to="/nearest-hub"
            className={location.pathname === '/nearest-hub' ? 'active' : ''}
            title="Find Nearest Hub"
          >
            <FaMapMarkerAlt />
            <span className="nav-text">Nearest Hub</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
