import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, subscriptionsAPI } from '../services/api';
import { FaHome, FaSignOutAlt, FaBox, FaCalendarCheck, FaHistory, FaInfoCircle } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const [profileRes, subRes] = await Promise.all([
                    usersAPI.getProfile(token),
                    subscriptionsAPI.getMySubscriptions(token)
                ]);
                setProfileData({ ...profileRes.data.data, subscriptions: subRes.data.data });
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="profile-page container"><div className="loader">Loading your profile...</div></div>;
    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-grid">
                    {error && <div className="error-banner glass">{error}</div>}
                    <aside className="profile-sidebar">
                        <div className="sidebar-header glass">
                            <div className="avatar-wrapper">
                                <div className="avatar-gradient">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <h3>{user.name}</h3>
                            <p className="user-email">{user.email}</p>
                        </div>

                        <nav className="profile-nav glass">
                            <button className="nav-item active">
                                <FaHome className="nav-icon" /> Dashboard
                            </button>
                            <button onClick={() => navigate('/subscriptions')} className="nav-item">
                                <FaBox className="nav-icon" /> Manage Boxes
                            </button>
                            <button onClick={logoutUser} className="nav-item logout-link">
                                <FaSignOutAlt className="nav-icon" /> Logout
                            </button>
                        </nav>
                    </aside>

                    <main className="profile-main">
                        {/* Subscriptions Section */}
                        <div className="content-card glass">
                            <div className="card-header">
                                <FaBox className="header-icon" />
                                <h3>Active Subscriptions</h3>
                            </div>
                            <div className="card-body">
                                {profileData.subscriptions?.length > 0 ? (
                                    <div className="item-grid">
                                        {profileData.subscriptions.map(sub => (
                                            <div key={sub._id} className="item-card sub-card">
                                                <div className="item-details">
                                                    <h4>{sub.boxType}</h4>
                                                    <span className={`status-pill status-${sub.status}`}>{sub.status}</span>
                                                </div>
                                                <div className="item-meta">
                                                    <p>{sub.frequency} delivery</p>
                                                    <p className="price-text">${sub.price} / week</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaBoxOpen className="empty-icon" />
                                        <p>No active subscriptions yet.</p>
                                        <button className="cta-button" onClick={() => navigate('/subscriptions')}>
                                            Explore Product Boxes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bookings Section */}
                        <div className="content-card glass">
                            <div className="card-header">
                                <FaCalendarCheck className="header-icon" />
                                <h3>My Bookings</h3>
                            </div>
                            <div className="card-body">
                                {profileData.bookings?.length > 0 ? (
                                    <div className="item-grid">
                                        {profileData.bookings.map(booking => (
                                            <div key={booking._id} className="item-card booking-card-item">
                                                <div className="item-details">
                                                    <h4>{booking.Workshop?.title}</h4>
                                                    <span className="status-pill status-upcoming">Upcoming</span>
                                                </div>
                                                <div className="item-meta">
                                                    <p>{new Date(booking.Workshop?.date).toLocaleDateString()}</p>
                                                    <p className="location-text">{booking.Workshop?.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaInfoCircle className="empty-icon" />
                                        <p>You haven't booked any workshops yet.</p>
                                        <button className="cta-button secondary" onClick={() => navigate('/workshops')}>
                                            Browse Workshops
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="content-card glass">
                            <div className="card-header">
                                <FaHistory className="header-icon" />
                                <h3>Order History</h3>
                            </div>
                            <div className="card-body">
                                {profileData?.orders?.length > 0 ? (
                                    <div className="order-history-list">
                                        {profileData.orders.map(order => (
                                            <div key={order._id} className="order-history-item">
                                                <div className="oh-info">
                                                    <h4>Order #{order.orderNumber || order.id.toString().slice(-6)}</h4>
                                                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="oh-meta">
                                                    <span className="oh-price">${order.total}</span>
                                                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state-card">
                                        <FaHistory className="empty-icon" />
                                        <p>No orders found in your history.</p>
                                        <button className="cta-button secondary" onClick={() => navigate('/products')}>
                                            Shop Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

// Add missing FaBoxOpen icon import logic if needed or use FaBox
const FaBoxOpen = FaBox;

export default Profile;
