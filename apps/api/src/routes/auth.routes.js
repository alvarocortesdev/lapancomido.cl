// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { validateToken } = require('../middlewares/validateToken');
const verifyTurnstile = require('../middlewares/verifyTurnstile');

// Rate limiting for auth endpoints (generous limit, actual OTP attempts tracked in DB)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow some buffer for page refreshes
  message: { 
    error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// First-time setup flow (Turnstile on login)
router.post('/login', authLimiter, verifyTurnstile, authController.login);
router.post('/initiate-setup', authLimiter, authController.initiateSetup);
router.post('/verify-setup-otp', authLimiter, authController.verifySetupOTP);
router.post('/complete-setup', authLimiter, authController.completeSetup);

// Normal login OTP flow
router.post('/verify-login-otp', authLimiter, authController.verifyLoginOTP);
router.post('/resend-otp', authLimiter, authController.resendOTP);

// Session management (requires auth)
router.post('/logout-all', validateToken, authController.logoutAll);

module.exports = router;
