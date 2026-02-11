import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ShoppingBag.css';

const ShoppingBag = ({ isOpen, onClose }) => {
  const { items, total, removeItem, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="shopping-bag-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close cart"
      />
      <aside
        className="shopping-bag"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <div className="shopping-bag__header">
          <h2 className="shopping-bag__title">Shopping Bag</h2>
          <button
            type="button"
            className="shopping-bag__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="shopping-bag__body">
          {items.length === 0 ? (
            <p className="shopping-bag__empty">Your bag is empty.</p>
          ) : (
            <ul className="shopping-bag__list">
              {items.map((item) => (
                <li key={item.productId} className="shopping-bag__item">
                  <div className="shopping-bag__item-info">
                    <span className="shopping-bag__item-name">{item.name}</span>
                    <span className="shopping-bag__item-price">
                      ${Number(item.price).toFixed(2)} × {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="shopping-bag__item-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="shopping-bag__qty"
                      aria-label={`Quantity for ${item.name}`}
                    />
                    <button
                      type="button"
                      className="shopping-bag__remove"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="shopping-bag__footer">
            <div className="shopping-bag__total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="shopping-bag__checkout-btn" onClick={onClose}>
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default ShoppingBag;
