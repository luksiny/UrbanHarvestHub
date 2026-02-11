const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'urban-harvest-hub-admin-secret-change-in-production';

/**
 * Express middleware: require valid Bearer JWT in Authorization header.
 * On success sets req.adminId (from token payload).
 * On failure sends 401 and does not call next().
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId ?? decoded.id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

module.exports = { verifyToken, JWT_SECRET };
