const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Workshop, Booking } = require('../models');
const { buildSearchWhere, workshopBody } = require('../utils/apiHelper');

const validateWorkshop = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('instructor').trim().notEmpty().withMessage('Instructor is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('category').isIn(['Gardening', 'Cooking', 'Preservation', 'Sustainability', 'Other']),
];

router.get('/', [
  query('category').optional().isIn(['Gardening', 'Cooking', 'Preservation', 'Sustainability', 'Other']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (category) where.category = category;
    Object.assign(where, buildSearchWhere(search, ['title', 'description', 'category']));

    const { rows: workshops, count: total } = await Workshop.findAndCountAll({
      where,
      order: [['date', 'ASC']],
      offset,
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: workshops.map(w => w.toJSON()),
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
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    const bookingCount = await Booking.count({
      where: { workshopId: workshop.id, status: { [Op.ne]: 'cancelled' } },
    });
    const data = workshop.toJSON();
    data.enrolled = bookingCount;
    data.available = workshop.capacity - bookingCount;
    res.json({ success: true, data });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: 'Invalid workshop ID' });
    }
    next(error);
  }
});

router.post('/', validateWorkshop, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const workshop = await Workshop.create(workshopBody(req.body));
    res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: workshop.toJSON(),
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

router.put('/:id', validateWorkshop, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    await workshop.update(workshopBody(req.body));
    res.json({
      success: true,
      message: 'Workshop updated successfully',
      data: workshop.toJSON(),
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

router.delete('/:id', async (req, res, next) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    await Booking.destroy({ where: { workshopId: req.params.id } });
    await workshop.destroy();
    res.json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
