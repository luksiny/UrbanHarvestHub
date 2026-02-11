import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { getAdminToken, clearAdminToken } from '../utils/auth';
import './AdminDashboard.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = getAdminToken();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeWorkshops: 0 });
  const [orders, setOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          adminAPI.getStats(token),
          adminAPI.getOrders(token),
        ]);
        const statsData = statsRes?.data ?? statsRes;
        const ordersData = ordersRes?.data ?? ordersRes;
        setStats({
          totalOrders: statsData?.totalOrders ?? 0,
          totalRevenue: statsData?.totalRevenue ?? 0,
          activeWorkshops: statsData?.activeWorkshops ?? 0,
        });
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        if (err.message && /token|denied|expired|invalid/i.test(err.message)) {
          clearAdminToken();
          navigate('/admin-login', { replace: true });
        }
      } finally {
        setLoadingStats(false);
        setLoadingOrders(false);
      }
    })();
  }, [token, navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      if (err.message && /token|denied|expired|invalid/i.test(err.message)) {
        clearAdminToken();
        navigate('/admin-login', { replace: true });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin-login', { replace: true });
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' }) : '—');
  const formatMoney = (n) => (n != null ? `$${Number(n).toFixed(2)}` : '$0.00');

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">🌱</span>
          <span>Admin</span>
        </div>
        <nav className="admin-sidebar__nav">
          <Link to="/admin/dashboard" className="admin-sidebar__link admin-sidebar__link--active">
            Dashboard
          </Link>
        </nav>
        <div className="admin-sidebar__footer">
          <a href="/" className="admin-sidebar__link">View site</a>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header__title">Dashboard</h1>
        </header>
        <section className="admin-stats">
          <h2 className="admin-section__title">Stats Overview</h2>
          {loadingStats ? (
            <p className="admin-loading">Loading stats…</p>
          ) : (
            <div className="admin-stats__grid">
              <div className="admin-stat">
                <span className="admin-stat__value">{stats.totalOrders}</span>
                <span className="admin-stat__label">Total Orders</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat__value">{formatMoney(stats.totalRevenue)}</span>
                <span className="admin-stat__label">Total Revenue</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat__value">{stats.activeWorkshops}</span>
                <span className="admin-stat__label">Active Workshops</span>
              </div>
            </div>
          )}
        </section>
        <section className="admin-orders">
          <h2 className="admin-section__title">Order Management</h2>
          {loadingOrders ? (
            <p className="admin-loading">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="admin-empty">No orders yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const id = order.id ?? order._id;
                    const shipping = order.shipping || {};
                    const customerName = shipping.fullName || shipping.email || '—';
                    return (
                      <tr key={id}>
                        <td>{order.orderNumber || id}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{customerName}</td>
                        <td>{formatMoney(order.total)}</td>
                        <td>
                          <select
                            className="admin-select"
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            disabled={updatingId === id}
                            aria-label={`Change status for order ${order.orderNumber}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === id && <span className="admin-updating">Updating…</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
