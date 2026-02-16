import React, { useState } from 'react';
import { subscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Subscriptions.css';

const Subscriptions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const boxes = [
        { type: 'Weekly Veggie', price: 25.00, features: ['Fresh Seasonal Greens', 'Local Roots', 'Organic Soil Grown'] },
        { type: 'Fruit Delight', price: 35.00, features: ['Local Orchard Picks', 'Exotic Seasonals', 'Vitamin Rich Bundle'] },
        { type: 'Chef Special', price: 50.00, features: ['Microgreens included', 'Rare Heritage Veggies', 'Herb Pairing Guide'] }
    ];

    const handleSubscribe = async (box) => {
        if (!user) return navigate('/login');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('userToken');
            await subscriptionsAPI.create({
                boxType: box.type,
                frequency: 'weekly',
                price: box.price
            }, token);
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            alert('Subscription failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="subscriptions-page container">
            <header className="page-header">
                <h1>Product Box Subscriptions</h1>
                <p>Get fresh, organic produce delivered to your door every week.</p>
            </header>

            {success && <div className="success-banner glass">Subscription successful! Redirecting to your profile...</div>}

            <div className="subscription-grid">
                {boxes.map(box => (
                    <div key={box.type} className="subscription-card glass">
                        <div className="card-badge">Weekly</div>
                        <h3>{box.type}</h3>
                        <div className="price">${box.price} <span>/ week</span></div>
                        <ul className="features">
                            {box.features.map(f => <li key={f}>{f}</li>)}
                        </ul>
                        <button
                            className="btn btn-primary"
                            disabled={submitting}
                            onClick={() => handleSubscribe(box)}
                        >
                            Subscribe Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subscriptions;
