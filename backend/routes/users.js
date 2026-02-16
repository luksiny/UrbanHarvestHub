const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User, Order, Booking, Workshop } = require('../models');
const { verifyToken, JWT_SECRET } = require('../middleware/verifyToken');

const TOKEN_EXPIRY = '24h';

// --- Public: Login ---
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
        console.log(`Login attempt for User: ${email}`);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Password mismatch for User: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        console.log(`User login successful: ${email}`);
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: { id: user.id, email: user.email, name: user.name },
                expiresIn: TOKEN_EXPIRY,
            },
        });
    } catch (error) {
        next(error);
    }
});

// --- Public: Register ---
const validateRegister = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
];

router.post('/register', validateRegister, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }
        const user = await User.create({ email, password, name });
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: { id: user.id, email: user.email, name: user.name },
            },
        });
    } catch (error) {
        next(error);
    }
});

// --- Protected: Get Profile & Orders ---
router.get('/profile', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'name', 'createdAt'],
        });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const [orders, bookings] = await Promise.all([
            Order.findAll({
                where: { shipping: { email: user.email } }, // Matching by email as userId might not be in Order yet
                order: [['createdAt', 'DESC']]
            }),
            Booking.findAll({
                where: { userId },
                include: [{ model: Workshop, as: 'Workshop' }],
                order: [['createdAt', 'DESC']]
            })
        ]);

        res.json({
            success: true,
            data: {
                user,
                orders,
                bookings
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
