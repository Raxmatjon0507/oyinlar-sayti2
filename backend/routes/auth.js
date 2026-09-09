const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../controllers/authMiddleware');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username 3-20 ta belgi orasida bo\'lishi kerak')
    .isAlphanumeric().withMessage('Username faqat harflar va raqamlardan iborat bo\'lishi kerak'),
  body('email')
    .isEmail().withMessage('Email formati noto\'g\'ri')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Parol kamida 6 ta belgi bo\'lishi kerak'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Parollar mos kelmaydi');
      }
      return true;
    })
], handleValidationErrors, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email formati noto\'g\'ri').normalizeEmail(),
  body('password').notEmpty().withMessage('Parol kiritish shart')
], handleValidationErrors, authController.login);

router.get('/profile', auth, authController.getProfile);

module.exports = router;
