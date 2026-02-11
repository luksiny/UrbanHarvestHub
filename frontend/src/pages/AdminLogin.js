import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { setAdminToken, isAdminTokenValid } from '../utils/auth';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAdminTokenValid()) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminAPI.login(email.trim(), password);
      const data = res?.data ?? res;
      const token = data?.token ?? data?.data?.token;
      if (!token) throw new Error('No token received');
      setAdminToken(token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1 className="admin-login__title">Admin</h1>
        <p className="admin-login__subtitle">Urban Harvest Hub</p>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          {error && <p className="admin-login__error" role="alert">{error}</p>}
          <label className="admin-login__label">
            Email
            <input
              type="email"
              className="admin-login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="admin-login__label">
            Password
            <input
              type="password"
              className="admin-login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <a href="/" className="admin-login__back">← Back to site</a>
      </div>
    </div>
  );
};

export default AdminLogin;
