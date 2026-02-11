import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { getProductImage, resolveProductImagePath } from '../utils/productImages';
import { IconPrice, IconUsers, IconInstructor } from '../components/DetailMetaIcons';
import { useCart } from '../context/CartContext';
import './Detail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getById(id);
        const data = response?.data ?? response;
        setProduct(data ?? null);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-skeleton">
            <div className="detail-skeleton__media" />
            <div className="detail-skeleton__title" />
            <div className="detail-skeleton__line" />
            <div className="detail-skeleton__line short" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="loading">Product not found</div>;
  }

  const imageUrl =
    resolveProductImagePath(product.image) || getProductImage(product.name, product.category);

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>
          ← Back to Products
        </button>

        <div className="detail-content">
          <div className="detail-main">
            <div className="detail-media">
              <img
                src={imageUrl}
                alt={product.name}
                className="detail-image"
              />
              <div className="detail-media-tag">
                <span className="badge">{product.category}</span>
                {product.organic && <span className="organic-badge">Organic</span>}
              </div>
            </div>

            <div className="detail-section">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            <div className="detail-info">
              <div className="detail-meta-grid">
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconPrice /></span>
                  <span className="price">${product.price}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconUsers /></span>
                  <span>{product.stock} {product.unit} in stock</span>
                </div>
                {product.seller && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-icon" aria-hidden="true"><IconInstructor /></span>
                    <span>{product.seller}</span>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-icon" aria-hidden="true"><IconInstructor /></span>
                    <span>{product.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="booking-card card">
              <div className="booking-card-header">
                <h1 className="detail-title">{product.name}</h1>
                <div className="detail-price-badge">
                  ${product.price}
                </div>
                <p className="detail-subtitle">
                  Fresh, local and ready for your next harvest.
                </p>
              </div>
              <div className="price-display">
                <span className="price-large">${product.price}</span>
                <span className="unit">per {product.unit}</span>
              </div>
              <button
                className="btn btn-primary"
                disabled={product.stock === 0}
                onClick={() =>
                  product.stock > 0 &&
                  addItem({
                    productId: product._id ?? product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    unit: product.unit || 'piece',
                  })
                }
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {product.stock > 0 && product.stock < 10 && (
                <p className="stock-warning">Only {product.stock} left in stock!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
