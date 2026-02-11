const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { Event } = require('../models');
const { buildSearchWhere, eventBody } = require('../utils/apiHelper');

const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('category').isIn(['Harvest Festival', 'Farmers Market', 'Community Garden', 'Educational', 'Social', 'Other']),
];

router.get('/', [
  query('category').optional().isIn(['Harvest Festival', 'Farmers Market', 'Community Garden', 'Educational', 'Social', 'Other']),
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

    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      order: [['date', 'ASC']],
      offset,
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: events.map(e => e.toJSON()),
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
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateEvent, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const event = await Event.create(eventBody(req.body));
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event.toJSON(),
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

router.put('/:id', validateEvent, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.update(eventBody(req.body));
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event.toJSON(),
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
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.destroy();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
