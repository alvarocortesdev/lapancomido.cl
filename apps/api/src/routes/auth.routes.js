// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /auth/login - Login with username/password
router.post('/login', authController.login);

// POST /auth/initiate-setup - Start first-time setup (sends OTP to email)
router.post('/initiate-setup', authController.initiateSetup);

// POST /auth/verify-setup-otp - Verify OTP for email validation
router.post('/verify-setup-otp', authController.verifySetupOTP);

// POST /auth/complete-setup - Set new password and complete setup
router.post('/complete-setup', authController.completeSetup);

module.exports = router;
