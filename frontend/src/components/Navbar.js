import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaHome, FaMapMarkerAlt, FaShoppingBag, FaUser, FaUserShield } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme, onOpenCart }) => {
  const location = useLocation();
  const { count } = useCart();
  const auth = useAuth();

  if (!auth) {
    return null; // Or a fallback navbar without auth features
  }

  const { user, admin, logoutUser, logoutAdmin } = auth;

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

          {/* Auth Section */}
          {admin ? (
            <div className="nav-auth-group">
              <Link to="/admin" className="nav-account admin-badge">
                <FaUserShield /> Admin
              </Link>
              <button onClick={logoutAdmin} className="logout-btn">Logout</button>
            </div>
          ) : user ? (
            <div className="nav-auth-group">
              <Link to="/profile" className="nav-account">
                <FaUser /> {user.name.split(' ')[0]}
              </Link>
              <Link to="/subscriptions" className="nav-link-sub">Boxes</Link>
              <button onClick={logoutUser} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className={`nav-login ${location.pathname === '/login' ? 'active' : ''}`}>
              <FaUser /> Login
            </Link>
          )}

          {/* Map Link */}
          <Link
            to="/nearest-hub"
            className={location.pathname === '/nearest-hub' ? 'active' : ''}
            title="Find Nearest Hub"
          >
            <FaMapMarkerAlt />
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
