import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Below-the-fold / non-LCP: lazy load to shrink main bundle and improve TBT/LCP
const BottomNav = lazy(() => import('./components/BottomNav'));
const SmartFooter = lazy(() => import('./components/SmartFooter'));
const UpdateBanner = lazy(() => import('./components/UpdateBanner'));
const SyncOrders = lazy(() => import('./components/SyncOrders').then((m) => ({ default: m.SyncOrders })));
const ShoppingBag = lazy(() => import('./components/ShoppingBag'));
const Toast = lazy(() => import('./components/Toast').then((m) => ({ default: m.Toast })));

// Lazy-load route chunks for faster initial load (Performance)
const Workshops = lazy(() => import('./pages/Workshops'));
const WorkshopDetail = lazy(() => import('./pages/WorkshopDetail'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const NearestHub = lazy(() => import('./pages/NearestHub'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const isAdminArea = location.pathname === '/admin-login' || location.pathname.startsWith('/admin');

  const handleOrderSynced = (orderNumber) => {
    setToastMessage(`Order #${orderNumber} synced successfully!`);
  };

  return (
    <>
      {!isAdminArea && (
        <Suspense fallback={null}>
          <SyncOrders onOrderSynced={handleOrderSynced} />
        </Suspense>
      )}
      {!isAdminArea && <Navbar theme={theme} toggleTheme={toggleTheme} onOpenCart={() => setCartOpen(true)} />}
      <main className="App__main" id="main-content">
        <div key={location.pathname} className="App__page">
          <Suspense fallback={<div className="App__fallback" aria-live="polite">Loading…</div>}>
            <Routes>
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/" element={<Home />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<WorkshopDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/nearest-hub" element={<NearestHub />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/order-success" element={<OrderSuccess />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      {!isAdminArea && (
        <Suspense fallback={null}>
          <ShoppingBag isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </Suspense>
      )}
      {!isAdminArea && toastMessage && (
        <Suspense fallback={null}>
          <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
        </Suspense>
      )}
      {!isAdminArea && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}
      {!isAdminArea && (
        <Suspense fallback={null}>
          <SmartFooter />
        </Suspense>
      )}
      {!isAdminArea && (
        <Suspense fallback={null}>
          <UpdateBanner />
        </Suspense>
      )}
    </>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f0f0f' : '#87A96B');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider>
        <div className="App">
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <AppContent theme={theme} toggleTheme={toggleTheme} />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
