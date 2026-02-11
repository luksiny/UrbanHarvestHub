import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Receipt from '../components/Receipt';
import './OrderSuccess.css';

const RECEIPT_CACHE_KEY = 'uh_receipt_cache';

function Confetti() {
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const colors = ['#87A96B', '#9BB87E', '#4B3621', '#F9F9F9', '#6B5344'];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100 - 50}vw`);
      piece.style.setProperty('--delay', `${Math.random() * 0.5}s`);
      piece.style.setProperty('--duration', `${2 + Math.random() * 1.5}s`);
      piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}%`;
      el.appendChild(piece);
    }
    const t = setTimeout(() => {
      el.querySelectorAll('.confetti-piece').forEach((p) => p.remove());
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return <div ref={containerRef} className="order-success__confetti" aria-hidden="true" />;
}

function downloadReceipt(orderNumber) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Receipt ${orderNumber}</title>
<style>body{font-family:system-ui,sans-serif;max-width:400px;margin:40px auto;padding:20px;color:#333;}
h1{font-size:1.25rem;margin-bottom:8px;} .meta{color:#666;font-size:0.9rem;}
.line{border-top:1px solid #eee;margin:16px 0;padding-top:16px;}
strong{color:#87A96B;} .foot{font-size:0.85rem;color:#666;margin-top:24px;}
</style></head>
<body>
<h1>Urban Harvest Hub</h1>
<p class="meta">Receipt · ${orderNumber}</p>
<p class="meta">${new Date().toLocaleString()}</p>
<div class="line"><p>Thank you for your order.</p><p>This is a mock receipt. No payment was processed.</p></div>
<p class="foot">Powered by Eco-Tech</p>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${orderNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function cacheReceipt(id, data) {
  try {
    const key = `${RECEIPT_CACHE_KEY}_${id}`;
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

function getCachedReceipt(id) {
  try {
    const key = `${RECEIPT_CACHE_KEY}_${id}`;
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

const OrderSuccess = () => {
  const { id: orderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '—';
  const queued = searchParams.get('queued') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      const cached = getCachedReceipt(orderId);
      if (cached && !cancelled) {
        setOrder(cached);
        setLoading(false);
        return;
      }
      try {
        const res = await ordersAPI.getById(orderId);
        const data = res?.data ?? res;
        if (!cancelled) {
          setOrder(data);
          cacheReceipt(orderId, data);
        }
      } catch (err) {
        if (!cancelled) {
          if (cached) setOrder(cached);
          else setError(err.message || 'Could not load order');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  if (orderId) {
    if (loading) {
      return (
        <div className="order-success">
          <div className="order-success__content glass-panel">
            <p className="order-success__number">Loading receipt…</p>
          </div>
        </div>
      );
    }
    if (error && !order) {
      return (
        <div className="order-success">
          <div className="order-success__content glass-panel">
            <p className="order-success__number">Order not found or unavailable.</p>
            <Link to="/products" className="btn btn-primary order-success__btn">Continue Shopping</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="order-success">
        <Confetti />
        <div className="order-success__content glass-panel order-success__content--receipt">
          <div className="order-success__icon" aria-hidden="true">✓</div>
          <h1 className="order-success__title">Order Confirmed</h1>
          {order && <Receipt order={order} />}
          <div className="order-success__actions order-success__actions--below">
            <Link to="/products" className="btn btn-secondary order-success__btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success">
      <Confetti />
      <div className="order-success__content glass-panel">
        <div className="order-success__icon" aria-hidden="true">✓</div>
        <h1 className="order-success__title">Order Confirmed</h1>
        <p className="order-success__number">Order #{orderNumber}</p>
        {queued && (
          <p className="order-success__queued">
            Your order was saved offline and will sync when you're back online.
          </p>
        )}
        <div className="order-success__actions">
          <button
            type="button"
            className="btn btn-primary order-success__btn"
            onClick={() => downloadReceipt(orderNumber)}
          >
            Download Receipt
          </button>
          <Link to="/products" className="btn btn-secondary order-success__btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
