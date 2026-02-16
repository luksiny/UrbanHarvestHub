import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  DollarSign,
  Calendar,
  Package,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { getAdminToken, clearAdminToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import AdminModal from './AdminModal';
import './AdminDashboard.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'status-orange' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'status-blue' },
  { value: 'shipped', label: 'Shipped', icon: Package, color: 'status-purple' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'status-green' },
  { value: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'status-red' },
];

const Skeleton = ({ className }) => (
  <div className={`skeleton ${className}`}></div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const token = getAdminToken();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeWorkshops: 0, totalUsers: 0 });
  const [orders, setOrders] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoadingStats(true);
        setLoadingData(true);
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
          totalUsers: statsData?.totalUsers ?? 0,
        });
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        if (err.message && /token|denied|expired|invalid/i.test(err.message)) {
          clearAdminToken();
          navigate('/admin-login', { replace: true });
        }
        setError(err.message);
      } finally {
        setLoadingStats(false);
        setLoadingData(false);
      }
    })();
  }, [token, navigate]);

  const fetchTabContent = async (tab) => {
    if (!token) return;
    setLoadingData(true);
    setError(null);
    try {
      let res;
      if (tab === 'workshops') {
        const { workshopsAPI } = await import('../services/api');
        res = await workshopsAPI.getAll();
        setWorkshops(res?.data ?? res);
      } else if (tab === 'products') {
        const { productsAPI } = await import('../services/api');
        res = await productsAPI.getAll();
        setProducts(res?.data ?? res);
      } else if (tab === 'events') {
        const { eventsAPI } = await import('../services/api');
        res = await eventsAPI.getAll();
        setEvents(res?.data ?? res);
      } else if (tab === 'orders') {
        res = await adminAPI.getOrders(token);
        setOrders(res?.data ?? res);
      }
    } catch (err) {
      const msg = err.message || 'Failed to fetch content';
      setError(msg);
      console.error('Fetch tab error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchTabContent(tab);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus, token);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
    try {
      if (type === 'workshops') {
        const { workshopsAPI } = await import('../services/api');
        await workshopsAPI.delete(id, token);
        setWorkshops(workshops.filter(w => w.id !== id && w._id !== id));
      } else if (type === 'products') {
        const { productsAPI } = await import('../services/api');
        await productsAPI.delete(id, token);
        setProducts(products.filter(p => p.id !== id && p._id !== id));
      } else if (type === 'events') {
        const { eventsAPI } = await import('../services/api');
        await eventsAPI.delete(id, token);
        setEvents(events.filter(e => e.id !== id && e._id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      let savedItem;
      if (activeTab === 'workshops') {
        const { workshopsAPI } = await import('../services/api');
        if (editingItem) {
          const res = await workshopsAPI.update(editingItem.id ?? editingItem._id, formData, token);
          savedItem = res?.data ?? res;
          setWorkshops(workshops.map(w => (w.id === savedItem.id || w._id === savedItem._id ? savedItem : w)));
        } else {
          const res = await workshopsAPI.create(formData, token);
          savedItem = res?.data ?? res;
          setWorkshops([savedItem, ...workshops]);
        }
      } else if (activeTab === 'products') {
        const { productsAPI } = await import('../services/api');
        if (editingItem) {
          const res = await productsAPI.update(editingItem.id ?? editingItem._id, formData, token);
          savedItem = res?.data ?? res;
          setProducts(products.map(p => (p.id === savedItem.id || p._id === savedItem._id ? savedItem : p)));
        } else {
          const res = await productsAPI.create(formData, token);
          savedItem = res?.data ?? res;
          setProducts([savedItem, ...products]);
        }
      } else if (activeTab === 'events') {
        const { eventsAPI } = await import('../services/api');
        if (editingItem) {
          const res = await eventsAPI.update(editingItem.id ?? editingItem._id, formData, token);
          savedItem = res?.data ?? res;
          setEvents(events.map(e => (e.id === savedItem.id || e._id === savedItem._id ? savedItem : e)));
        } else {
          const res = await eventsAPI.create(formData, token);
          savedItem = res?.data ?? res;
          setEvents([savedItem, ...events]);
        }
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin-login', { replace: true });
  };

  const formatMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TrendingUp size={24} color="#2D5A27" />
            <span>UrbanHarvest</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>
          <div className="nav-label">Management</div>
          <button
            className={`nav-item ${activeTab === 'workshops' ? 'active' : ''}`}
            onClick={() => handleTabChange('workshops')}
          >
            <Calendar size={20} />
            <span>Workshops</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <Package size={20} />
            <span>Products</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => handleTabChange('events')}
          >
            <ShoppingBag size={20} />
            <span>Events</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="nav-item">
            <ExternalLink size={20} />
            <span>View Site</span>
          </a>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <div className="header-title">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Welcome back, {admin?.name || 'Admin'}! Here's what's happening today.</p>
          </div>
          {activeTab !== 'orders' && (
            <button className="btn-add" onClick={openAddModal}>
              + Add {activeTab.slice(0, -1)}
            </button>
          )}
        </header>

        {error && <div className="admin-alert error">{error}</div>}

        {activeTab === 'orders' && (
          <>
            <section className="stats-grid">
              <div className="stat-card orders">
                <div className="stat-icon"><ShoppingBag size={24} /></div>
                <div className="stat-info">
                  <span className="label">Total Orders</span>
                  <h3>{loadingStats ? <Skeleton className="h-8 w-16" /> : stats.totalOrders}</h3>
                </div>
              </div>
              <div className="stat-card revenue">
                <div className="stat-icon"><DollarSign size={24} /></div>
                <div className="stat-info">
                  <span className="label">Revenue</span>
                  <h3>{loadingStats ? <Skeleton className="h-8 w-24" /> : formatMoney(stats.totalRevenue)}</h3>
                </div>
              </div>
              <div className="stat-card customers">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <span className="label">Active Customers</span>
                  <h3>{loadingStats ? <Skeleton className="h-8 w-16" /> : stats.totalUsers}</h3>
                </div>
              </div>
            </section>

            <section className="table-section glass">
              <div className="table-header">
                <h2>Recent Orders</h2>
              </div>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td><Skeleton className="h-4 w-20" /></td>
                          <td><Skeleton className="h-4 w-32" /></td>
                          <td><Skeleton className="h-6 w-24 rounded-full" /></td>
                          <td><Skeleton className="h-4 w-24" /></td>
                          <td><Skeleton className="h-4 w-16" /></td>
                          <td><Skeleton className="h-8 w-8 ml-auto" /></td>
                        </tr>
                      ))
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          <Package size={48} />
                          <h3>No Orders Found</h3>
                          <p>When you get orders, they will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => {
                        const id = order.id ?? order._id;
                        const statusObj = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
                        return (
                          <tr key={id}>
                            <td className="font-mono">#{order.orderNumber || id.toString().slice(-6)}</td>
                            <td>
                              <div className="customer-cell">
                                <span className="name">{order.shipping?.fullName || 'Guest'}</span>
                                <span className="email">{order.shipping?.email}</span>
                              </div>
                            </td>
                            <td>
                              <select
                                className={`status-badge ${statusObj.color}`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(id, e.target.value)}
                                disabled={updatingId === id}
                              >
                                {STATUS_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="font-semibold">{formatMoney(order.total)}</td>
                            <td className="text-right">
                              <button className="btn-icon">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab !== 'orders' && (
          <section className="table-section glass">
            <div className="table-header">
              <h2>All {activeTab}</h2>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>{activeTab === 'products' ? 'Price' : 'Date'}</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td><Skeleton className="h-4 w-48" /></td>
                        <td><Skeleton className="h-4 w-24" /></td>
                        <td><Skeleton className="h-4 w-24" /></td>
                        <td><Skeleton className="h-8 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (activeTab === 'workshops' ? workshops : activeTab === 'products' ? products : events).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <Package size={48} />
                        <h3>No {activeTab} Found</h3>
                        <p>Click the add button to create your first {activeTab.slice(0, -1)}.</p>
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'workshops' ? workshops : activeTab === 'products' ? products : events).map(item => (
                      <tr key={item.id ?? item._id}>
                        <td className="font-semibold">{item.name || item.title}</td>
                        <td><span className="category-tag">{item.category}</span></td>
                        <td>{activeTab === 'products' ? formatMoney(item.price) : formatDate(item.date)}</td>
                        <td className="text-right">
                          <div className="action-buttons">
                            <button className="btn-icon edit" onClick={() => openEditModal(item)}>
                              ✎
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDelete(item.id ?? item._id, activeTab)}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {showModal && (
        <AdminModal
          type={activeTab}
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
