const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Product, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

function generateOrderNumber() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `UH-${Date.now().toString(36).toUpperCase().slice(-4)}-${n}`;
}

const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
  body('items.*.name').trim().notEmpty().withMessage('Each item must have a name'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Each item must have a valid price'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item must have quantity >= 1'),
  body('shipping').isObject().withMessage('Shipping info is required'),
  body('shipping.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shipping.address').trim().notEmpty().withMessage('Address is required'),
  body('shipping.city').trim().notEmpty().withMessage('City is required'),
  body('shipping.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shipping.email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('total').isFloat({ min: 0 }).withMessage('Valid total is required'),
  body('payment').optional().isObject(),
];

router.post('/', validateOrder, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { items, shipping, payment, total } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    const orderNumber = generateOrderNumber();
    const { sequelize } = require('../models');
    const t = await sequelize.transaction();
    try {
      const order = await Order.create(
        {
          orderNumber,
          items,
          shipping,
          payment: payment || null,
          total: parseFloat(total),
          status: 'pending',
        },
        { transaction: t }
      );

      // Create order_items rows with foreign keys to orders and products (fully relational)
      for (const item of items) {
        const productId = parseInt(item.productId, 10);
        if (Number.isNaN(productId)) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Invalid productId: ${item.productId}`,
          });
        }
        await OrderItem.create(
          {
            orderId: order.id,
            productId,
            productName: String(item.name || '').trim() || 'Product',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity, 10) || 1,
            unit: String(item.unit || 'piece').trim().slice(0, 20) || 'piece',
          },
          { transaction: t }
        );
      }

      await t.commit();
      const data = order.toJSON();
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data,
      });
    } catch (txErr) {
      if (t && !t.finished) await t.rollback();
      throw txErr;
    }
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'One or more product IDs do not exist. Use valid product ids from the products table.',
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => e.message),
      });
    }
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    // JOIN query: order + order_items + products in one go (product_name from products, quantity from order_items)
    const rows = await sequelize.query(
      `SELECT
         o.id, o.orderNumber, o.items, o.shipping, o.payment, o.total, o.status, o.createdAt, o.updatedAt,
         oi.id AS order_item_id, oi.quantity, oi.price, oi.unit, oi.productName,
         p.name AS product_name
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.id = :id
       ORDER BY oi.id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!rows || rows.length === 0) {
      const orderExists = await Order.findByPk(id);
      if (!orderExists) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      // Order exists but has no order_items rows; return order with empty items
      const order = orderExists.toJSON();
      order.lineItems = [];
      return res.json({ success: true, data: order });
    }

    const first = rows[0];
    const data = {
      id: first.id,
      _id: first.id,
      orderNumber: first.orderNumber,
      items: first.items,
      shipping: first.shipping,
      payment: first.payment,
      total: typeof first.total === 'string' ? parseFloat(first.total) : first.total,
      status: first.status,
      createdAt: first.createdAt,
      updatedAt: first.updatedAt,
      lineItems: rows.map((r) => ({
        order_item_id: r.order_item_id,
        product_name: r.product_name,
        quantity: r.quantity,
        price: typeof r.price === 'string' ? parseFloat(r.price) : r.price,
        unit: r.unit,
        productName: r.productName,
      })),
    };
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
