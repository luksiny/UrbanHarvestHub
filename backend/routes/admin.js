const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Admin, Order, Workshop } = require('../models');
const { verifyToken, JWT_SECRET } = require('../middleware/verifyToken');

const TOKEN_EXPIRY = '2h';

// --- Public: login (no auth) ---
const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { adminId: admin.id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
        expiresIn: TOKEN_EXPIRY,
      },
    });
  } catch (error) {
    next(error);
  }
});

// --- Protected routes (require Bearer token) ---

router.get('/stats', verifyToken, async (req, res, next) => {
  try {
    const [totalOrders, revenueResult, activeWorkshops] = await Promise.all([
      Order.count(),
      Order.sum('total'),
      Workshop.count({ where: { date: { [Op.gte]: new Date() } } }),
    ]);
    const totalRevenue = Number(revenueResult) || 0;
    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeWorkshops,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', verifyToken, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'orderNumber', 'total', 'status', 'shipping', 'createdAt'],
    });
    const data = orders.map((o) => {
      const json = o.toJSON ? o.toJSON() : o.get({ plain: true });
      if (typeof json.total === 'string') json.total = parseFloat(json.total);
      return json;
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/status', verifyToken, [
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    await order.update({ status });
    const data = order.toJSON ? order.toJSON() : order.get({ plain: true });
    if (typeof data.total === 'string') data.total = parseFloat(data.total);
    res.json({ success: true, message: 'Order status updated.', data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
