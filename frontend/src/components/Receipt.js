import React, { useRef } from 'react';
import './Receipt.css';

/**
 * Receipt UI: order number + badge, items table, shipping/payment grid, grand total.
 * PWA: Save PDF uses window.print() (works offline; user can choose "Save as PDF" in dialog).
 */
function formatMoney(n) {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : '$0.00';
}

function Receipt({ order }) {
  const receiptRef = useRef(null);

  if (!order) return null;

  const orderNumber = order.orderNumber || order.order_number || '—';
  const lineItems = order.lineItems || order.line_items || [];
  const fallbackItems = Array.isArray(order.items) ? order.items : [];
  const items = lineItems.length > 0
    ? lineItems.map((li) => ({
        name: li.product_name ?? li.productName ?? 'Product',
        quantity: li.quantity ?? 1,
        price: li.price ?? 0,
      }))
    : fallbackItems.map((i) => ({
        name: i.name ?? 'Product',
        quantity: i.quantity ?? 1,
        price: i.price ?? 0,
      }));

  const shipping = order.shipping || {};
  const payment = order.payment || {};
  const last4 = payment.last4 ?? payment.last4Digits ?? '****';
  const total = order.total != null ? order.total : 0;

  const savePdfReceipt = () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  };

  return (
    <div ref={receiptRef} className="receipt no-print-actions">
      <header className="receipt__header">
        <h1 className="receipt__order-number">{orderNumber}</h1>
        <span className="receipt__badge">Order Placed</span>
      </header>

      <section className="receipt__section">
        <h2 className="receipt__section-title">Items</h2>
        <div className="receipt__table-wrap">
          <table className="receipt__table" role="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col" className="receipt__th-num">Qty</th>
                <th scope="col" className="receipt__th-num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const price = typeof row.price === 'string' ? parseFloat(row.price) : row.price;
                const qty = typeof row.quantity === 'number' ? row.quantity : parseInt(row.quantity, 10) || 1;
                const subtotal = (Number.isFinite(price) ? price : 0) * qty;
                return (
                  <tr key={idx} className="receipt__row">
                    <td className="receipt__cell receipt__cell--name">{row.name}</td>
                    <td className="receipt__cell receipt__cell--num">{qty}</td>
                    <td className="receipt__cell receipt__cell--num">{formatMoney(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="receipt__section receipt__grid">
        <div className="receipt__block">
          <h2 className="receipt__section-title">Shipping</h2>
          <address className="receipt__address">
            {shipping.fullName && <span className="receipt__line">{shipping.fullName}</span>}
            {shipping.address && <span className="receipt__line">{shipping.address}</span>}
            {(shipping.city || shipping.postalCode) && (
              <span className="receipt__line">
                {[shipping.city, shipping.postalCode].filter(Boolean).join(' ')}
              </span>
            )}
            {shipping.email && <span className="receipt__line">{shipping.email}</span>}
          </address>
        </div>
        <div className="receipt__block">
          <h2 className="receipt__section-title">Payment</h2>
          <p className="receipt__payment">
            {payment.method === 'card' ? 'Card' : payment.method || 'Card'} ending in {last4}
          </p>
        </div>
      </section>

      <div className="receipt__grand-total">
        <span className="receipt__grand-total-label">Grand Total</span>
        <span className="receipt__grand-total-value">{formatMoney(total)}</span>
      </div>

      <div className="receipt__actions print-hidden">
        <button
          type="button"
          className="btn btn-primary receipt__btn"
          onClick={savePdfReceipt}
          aria-label="Save PDF receipt using print dialog"
        >
          Save PDF Receipt
        </button>
      </div>
    </div>
  );
}

export default Receipt;
