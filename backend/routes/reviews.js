const express = require('express');
const router = express.Router();
const { Review, User } = require('../models');
const { verifyToken } = require('../middleware/verifyToken');
const { body, validationResult } = require('express-validator');

// Get reviews for a specific target (Product/Workshop/Event)
router.get('/:type/:id', async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: { targetType: req.params.type, targetId: req.params.id },
            include: [{ model: User, as: 'User', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: reviews });
    } catch (err) {
        next(err);
    }
});

// Post a new review
router.post('/', verifyToken, [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().notEmpty(),
    body('targetId').isInt(),
    body('targetType').isIn(['Product', 'Workshop', 'Event'])
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const userId = req.user.userId;
        const { rating, comment, targetId, targetType } = req.body;

        const review = await Review.create({
            rating, comment, targetId, targetType, userId
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
