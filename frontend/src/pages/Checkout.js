import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { enqueueOrder } from '../utils/orderQueue';
import './Checkout.css';

const STEPS = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
  });
  const [payment, setPayment] = useState({ method: 'card', last4: '' });
  const [errors, setErrors] = useState({});

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName?.trim()) e.fullName = 'Required';
    if (!shipping.address?.trim()) e.address = 'Required';
    if (!shipping.city?.trim()) e.city = 'Required';
    if (!shipping.postalCode?.trim()) e.postalCode = 'Required';
    if (!shipping.email?.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      navigate('/products');
      return;
    }
    setLoading(true);
    const orderPayload = {
      items: items.map((i) => ({
        productId: String(i.productId),
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        unit: i.unit || 'piece',
      })),
      shipping: {
        fullName: shipping.fullName.trim(),
        address: shipping.address.trim(),
        city: shipping.city.trim(),
        postalCode: shipping.postalCode.trim(),
        email: shipping.email.trim(),
      },
      payment: { method: payment.method, last4: payment.last4.replace(/\D/g, '').slice(-4) || '0000' },
      total: total.toFixed(2),
    };

    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (isOnline) {
      try {
        const res = await ordersAPI.create(orderPayload);
        const data = res?.data ?? res;
        const orderId = data?.id ?? data?._id;
        const orderNumber = data?.orderNumber || `UH-${Date.now()}`;
        clearCart();
        setLoading(false);
        if (orderId != null) {
          navigate(`/order-success/${orderId}`);
        } else {
          navigate(`/order-success?order=${encodeURIComponent(orderNumber)}`);
        }
      } catch (err) {
        setErrors({ submit: err.message || 'Failed to place order' });
        setLoading(false);
      }
    } else {
      try {
        await enqueueOrder(orderPayload);
        const tempOrderNumber = `UH-OFFLINE-${Date.now().toString(36).toUpperCase()}`;
        clearCart();
        setLoading(false);
        navigate(`/order-success?order=${encodeURIComponent(tempOrderNumber)}&queued=true`);
      } catch (err) {
        setErrors({ submit: 'Failed to save order for later sync.' });
        setLoading(false);
      }
    }
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="checkout-page">
        <div className="container">
          <p className="checkout-empty">Your cart is empty.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-steps">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`checkout-step ${step >= i + 1 ? 'active' : ''}`}
              onClick={() => step > i + 1 && setStep(i + 1)}
              disabled={step < i + 1}
            >
              <span className="checkout-step__num">{i + 1}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="checkout-panel glass-panel">
          {step === 1 && (
            <>
              <h2 className="checkout-panel__heading">Shipping</h2>
              <div className="checkout-form">
                <label className="checkout-label">
                  Full name
                  <input
                    type="text"
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleShippingChange}
                    className="checkout-input"
                    placeholder="Jane Doe"
                  />
                  {errors.fullName && <span className="checkout-error">{errors.fullName}</span>}
                </label>
                <label className="checkout-label">
                  Address
                  <input
                    type="text"
                    name="address"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    className="checkout-input"
                    placeholder="123 Green St"
                  />
                  {errors.address && <span className="checkout-error">{errors.address}</span>}
                </label>
                <div className="checkout-row">
                  <label className="checkout-label">
                    City
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="checkout-input"
                      placeholder="City"
                    />
                    {errors.city && <span className="checkout-error">{errors.city}</span>}
                  </label>
                  <label className="checkout-label">
                    Postal code
                    <input
                      type="text"
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={handleShippingChange}
                      className="checkout-input"
                      placeholder="12345"
                    />
                    {errors.postalCode && <span className="checkout-error">{errors.postalCode}</span>}
                  </label>
                </div>
                <label className="checkout-label">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={shipping.email}
                    onChange={handleShippingChange}
                    className="checkout-input"
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className="checkout-error">{errors.email}</span>}
                </label>
                <button
                  type="button"
                  className="btn btn-primary checkout-next"
                  onClick={() => validateShipping() && setStep(2)}
                >
                  Continue to Payment
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="checkout-panel__heading">Mock Payment</h2>
              <div className="checkout-form">
                <label className="checkout-label">
                  Last 4 digits (mock)
                  <input
                    type="text"
                    placeholder="4242"
                    maxLength="4"
                    value={payment.last4}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPayment((p) => ({ ...p, last4: v }));
                    }}
                    className="checkout-input"
                  />
                </label>
                <p className="checkout-mock-note">This is a demo. No real payment is processed.</p>
                <button
                  type="button"
                  className="btn btn-primary checkout-next"
                  onClick={() => setStep(3)}
                >
                  Continue to Review
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="checkout-panel__heading">Review</h2>
              <div className="checkout-review">
                <div className="checkout-review__section">
                  <strong>Shipping</strong>
                  <p>{shipping.fullName}</p>
                  <p>{shipping.address}, {shipping.city} {shipping.postalCode}</p>
                  <p>{shipping.email}</p>
                </div>
                <div className="checkout-review__section">
                  <strong>Items</strong>
                  <ul>
                    {items.map((i) => (
                      <li key={i.productId}>
                        {i.name} × {i.quantity} — ${(Number(i.price) * i.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="checkout-review__total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                {errors.submit && <p className="checkout-error">{errors.submit}</p>}
                <button
                  type="button"
                  className="btn btn-primary checkout-place"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing…' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
