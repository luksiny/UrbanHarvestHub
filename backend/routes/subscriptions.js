const express = require('express');
const router = express.Router();
const { Subscription } = require('../models');
const { verifyToken } = require('../middleware/verifyToken');
const { body, validationResult } = require('express-validator');

// Get active subscriptions of the user
router.get('/my-subscriptions', verifyToken, async (req, res, next) => {
    try {
        const subs = await Subscription.findAll({
            where: { userId: req.user.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: subs });
    } catch (err) {
        next(err);
    }
});

// Subscribe to a new box
router.post('/', verifyToken, [
    body('boxType').isIn(['Weekly Veggie', 'Fruit Delight', 'Chef Special', 'Organic Starter']),
    body('frequency').isIn(['weekly', 'bi-weekly', 'monthly']),
    body('price').isDecimal()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const userId = req.user.userId;
        const { boxType, frequency, price } = req.body;

        const sub = await Subscription.create({
            boxType, frequency, price, userId, status: 'active'
        });

        res.status(201).json({ success: true, data: sub });
    } catch (err) {
        next(err);
    }
});

// Update subscription status
router.patch('/:id/status', verifyToken, async (req, res, next) => {
    try {
        const { status } = req.body;
        const sub = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.userId } });
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

        await sub.update({ status });
        res.json({ success: true, data: sub });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
