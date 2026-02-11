const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { Booking, Workshop } = require('../models');
const { Op } = require('sequelize');

const validateBooking = [
  body('workshopId').notEmpty().withMessage('Workshop ID is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('userName').trim().notEmpty().withMessage('User name is required'),
  body('userEmail').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('userPhone').optional().trim(),
];

router.get('/', [
  query('userId').optional().trim(),
  query('workshopId').optional(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { userId, workshopId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (userId) where.userId = userId;
    if (workshopId) where.workshopId = workshopId;

    const { rows: bookings, count: total } = await Booking.findAndCountAll({
      where,
      include: [{ model: Workshop, as: 'Workshop', attributes: ['id', 'title', 'date', 'location'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const data = bookings.map(b => {
      const j = b.toJSON();
      if (j.Workshop) {
        j.workshopId = j.Workshop;
        j.workshopId._id = j.workshopId.id;
      }
      return j;
    });

    res.json({
      success: true,
      data,
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
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Workshop, as: 'Workshop' }],
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const j = booking.toJSON();
    if (j.Workshop) {
      j.workshopId = j.Workshop;
      j.workshopId._id = j.workshopId.id;
    }
    res.json({ success: true, data: j });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBooking, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const workshop = await Workshop.findByPk(req.body.workshopId);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    const currentBookings = await Booking.count({
      where: { workshopId: req.body.workshopId, status: { [Op.ne]: 'cancelled' } },
    });
    if (currentBookings >= workshop.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Workshop is fully booked',
      });
    }
    const booking = await Booking.create({
      workshopId: req.body.workshopId,
      userId: req.body.userId,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone || null,
    });
    const withWorkshop = await Booking.findByPk(booking.id, {
      include: [{ model: Workshop, as: 'Workshop', attributes: ['id', 'title', 'date', 'location'] }],
    });
    const j = withWorkshop.toJSON();
    if (j.Workshop) {
      j.workshopId = j.Workshop;
      j.workshopId._id = j.workshopId.id;
    }
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: j,
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

router.put('/:id', [
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled']),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'refunded']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Workshop, as: 'Workshop', attributes: ['id', 'title', 'date', 'location'] }],
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const { status, paymentStatus } = req.body;
    if (status !== undefined) booking.status = status;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    await booking.save();
    const j = booking.toJSON();
    if (j.Workshop) {
      j.workshopId = j.Workshop;
      j.workshopId._id = j.workshopId.id;
    }
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: j,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    await booking.destroy();
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
