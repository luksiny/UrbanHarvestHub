const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Product } = require('../models');
const { buildSearchWhere } = require('../utils/apiHelper');
const { verifyToken } = require('../middleware/verifyToken');

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Other']),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

router.get('/', [
  query('category').optional().isIn(['Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Other']),
  query('search').optional().trim(),
  query('minPrice').optional().trim().isFloat({ min: 0 }),
  query('maxPrice').optional().trim().isFloat({ min: 0 }),
  query('organic').optional().isIn(['true', 'false']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { category, search, organic, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    const rawMin = req.query.minPrice;
    const rawMax = req.query.maxPrice;
    const minPrice = rawMin !== undefined && String(rawMin).trim() !== '' ? parseFloat(rawMin) : null;
    const maxPrice = rawMax !== undefined && String(rawMax).trim() !== '' ? parseFloat(rawMax) : null;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (category) where.category = category;
    Object.assign(where, buildSearchWhere(search, ['name', 'description', 'category']));
    if ((minPrice != null && !Number.isNaN(minPrice)) || (maxPrice != null && !Number.isNaN(maxPrice))) {
      where.price = {};
      if (minPrice != null && !Number.isNaN(minPrice)) where.price[Op.gte] = minPrice;
      if (maxPrice != null && !Number.isNaN(maxPrice)) where.price[Op.lte] = maxPrice;
    }
    if (organic !== undefined) where.organic = organic === 'true';

    const order = sort === 'price' ? [['price', 'ASC']]
      : sort === 'priceDesc' ? [['price', 'DESC']]
      : sort === 'name' ? [['name', 'ASC']]
      : [['createdAt', 'DESC']];

    const { rows: products, count: total } = await Product.findAndCountAll({
      where,
      order,
      offset,
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: products.map(p => p.toJSON()),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, validateProduct, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product.toJSON(),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      });
    }
    next(error);
  }
});

router.put('/:id', verifyToken, validateProduct, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.update(req.body);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product.toJSON(),
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message),
      });
    }
    next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.destroy();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
