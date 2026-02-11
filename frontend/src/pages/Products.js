import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { getProductImage, resolveProductImagePath } from '../utils/productImages';
import { SkeletonGrid } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import './Products.css';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text, searchTerm) => {
  if (!text || typeof text !== 'string') return text;
  const term = searchTerm.trim();
  if (!term) return text;
  try {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
};

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Other'];
const ECO_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Eco / Organic only' },
  { value: 'false', label: 'Non-organic only' }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    ecoRating: ''
  });
  const [addToCartPulse, setAddToCartPulse] = useState(null);
  const initialLoadDone = useRef(false);
  const { addItem } = useCart();

  const applyFilters = useCallback(() => {
    const params = {
      limit: 50,
      sort: 'name',
      ...(searchTerm && { search: searchTerm }),
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice !== '' && filters.minPrice != null && { minPrice: String(filters.minPrice).trim() }),
      ...(filters.maxPrice !== '' && filters.maxPrice != null && { maxPrice: String(filters.maxPrice).trim() }),
      ...(filters.ecoRating && { organic: filters.ecoRating === 'true' })
    };
    return params;
  }, [searchTerm, filters.category, filters.minPrice, filters.maxPrice, filters.ecoRating]);

  useEffect(() => {
    if (!filterDrawerOpen) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') setFilterDrawerOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [filterDrawerOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!initialLoadDone.current) setLoading(true);
        const params = applyFilters();
        const response = await productsAPI.getAll(params);
        const rawList = response?.data ?? response ?? [];
        const list = Array.isArray(rawList) ? rawList : [];
        const seen = new Set();
        const unique = list.filter((p) => {
          const id = p._id ?? p.id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setProducts(unique);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
        initialLoadDone.current = true;
      }
    };

    fetchProducts();
  }, [applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    addItem({
      productId: product._id ?? product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit || 'piece',
    });
    setAddToCartPulse(product._id);
    setTimeout(() => setAddToCartPulse(null), 400);
  };

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.category,
    filters.ecoRating
  ].filter(Boolean).length;

  const initialLoading = loading && products.length === 0;

  return (
    <div className="master-detail-page products-page">
      <div className="master-detail-bar">
        <div className="container master-detail-bar__inner">
          <input
            type="search"
            className="master-detail-bar__input products-page__search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search products"
          />
          <button
            type="button"
            className="products-page__filter-trigger"
            onClick={() => setFilterDrawerOpen(true)}
            aria-label="Open filters"
            aria-expanded={filterDrawerOpen}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="products-page__filter-count" aria-hidden="true">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Slide-out filter drawer */}
      <div
        className={`filter-drawer ${filterDrawerOpen ? 'filter-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Advanced filters"
      >
        <div
          className="filter-drawer__backdrop"
          onClick={() => setFilterDrawerOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setFilterDrawerOpen(false)}
          aria-hidden="true"
        />
        <div className="filter-drawer__panel">
          <div className="filter-drawer__header">
            <h2 className="filter-drawer__title">Filters</h2>
            <button
              type="button"
              className="filter-drawer__close"
              onClick={() => setFilterDrawerOpen(false)}
              aria-label="Close filters"
            >
              ×
            </button>
          </div>
          <div className="filter-drawer__body">
            <fieldset className="filter-drawer__fieldset">
              <legend className="filter-drawer__legend">Price range</legend>
              <div className="filter-drawer__row">
                <label className="filter-drawer__label">
                  <span className="filter-drawer__label-text">Min $</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="filter-drawer__input"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    aria-label="Minimum price"
                  />
                </label>
                <label className="filter-drawer__label">
                  <span className="filter-drawer__label-text">Max $</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="filter-drawer__input"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    aria-label="Maximum price"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="filter-drawer__fieldset">
              <legend className="filter-drawer__legend">Category</legend>
              <select
                className="filter-drawer__select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="filter-drawer__fieldset">
              <legend className="filter-drawer__legend">Eco rating</legend>
              <div className="filter-drawer__radios">
                {ECO_OPTIONS.map(({ value, label }) => (
                  <label key={value || 'any'} className="filter-drawer__radio-label">
                    <input
                      type="radio"
                      name="ecoRating"
                      className="filter-drawer__radio"
                      value={value}
                      checked={filters.ecoRating === value}
                      onChange={() => handleFilterChange('ecoRating', value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="filter-drawer__footer">
            <button
              type="button"
              className="btn btn-secondary filter-drawer__btn"
              onClick={() => setFilters({ minPrice: '', maxPrice: '', category: '', ecoRating: '' })}
            >
              Clear all
            </button>
            <button
              type="button"
              className="btn btn-primary filter-drawer__btn"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="container master-detail-content">
        <h1 className="master-detail-title">Products</h1>

        {error && <div className="error">{error}</div>}

        {loading && products.length > 0 && (
          <p className="master-detail-updating">Updating results…</p>
        )}

        {initialLoading ? (
          <SkeletonGrid count={6} />
        ) : products.length === 0 ? (
          <div className="no-results">
            <p>No products found. Try adjusting your search or filters.</p>
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Make sure the backend server is running (e.g. npm run server) and the database has products.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => {
              const id = product._id ?? product.id ?? `p-${index}`;
              const imageUrl = resolveProductImagePath(product.image) || getProductImage(product.name, product.category) || '/images/products/trowel.jpg';
              const isPulsing = addToCartPulse === id;
              return (
                <article
                  key={id}
                  className="product-card"
                >
                  <Link to={`/products/${id}`} className="product-card__link">
                    <div className="product-card__media">
                      <img
                        src={imageUrl}
                        alt=""
                        className="product-card__image"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/trowel.jpg';
                        }}
                      />
                      <span className="product-card__badge">{product.category}</span>
                      {product.organic && (
                        <span className="product-card__badge product-card__badge--organic">Organic</span>
                      )}
                    </div>
                    <div className="product-card__body">
                      <h2 className="product-card__title">
                        {searchTerm.trim()
                          ? highlightMatch(product.name, searchTerm)
                          : product.name}
                      </h2>
                      <p className="product-card__meta">
                        {product.stock} {product.unit} in stock
                      </p>
                      <p className="product-card__excerpt">
                        {product.description
                          ? product.description.substring(0, 100) + '…'
                          : ''}
                      </p>
                      <div className="product-card__footer">
                        <span className="product-card__seller">{product.seller || product.category}</span>
                        <span className="product-card__price">
                          {product.price != null && product.price !== ''
                            ? `$${Number(product.price).toFixed(2)}`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className={`product-card__add ${isPulsing ? 'product-card__add--pulse' : ''}`}
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock === 0}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
