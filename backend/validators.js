import { body, validationResult } from 'express-validator';
import User from './models/User.js';

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter your email address.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Please enter your password.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return first error message to match frontend's error toast
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  }
];

/**
 * Validation rules for registering a new driver
 */
export const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail()
    .custom(async (value) => {
      // Skip check if DB connection is not ready (in-memory mode fallback)
      try {
        const user = await User.findOne({ email: value.toLowerCase() });
        if (user) {
          throw new Error('A user with this email is already registered.');
        }
      } catch (err) {
        if (err.message.includes('already registered')) {
          throw err;
        }
        // If DB query fails due to no connection, log it and proceed
        console.warn('DB query failed during validation, ignoring uniqueness check:', err.message);
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  }
];
