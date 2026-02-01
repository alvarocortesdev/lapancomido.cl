// src/controllers/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@lapancomido/database';
import { validatePassword, validateEmail } from '../utils/validation.js';
import * as authService from '../services/auth.service.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '30d';

/**
 * Mask email for display (e.g., t***t@gmail.com)
 */
function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * POST /auth/login
 * Validates username + password, checks device trust, triggers OTP if needed
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username requerido' });
    }
    
    const user = await prisma.users.findUnique({
      where: { username }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Password is required
    if (!password) {
      return res.status(400).json({ error: 'Contraseña requerida' });
    }
    
    // Check if user has a password hash
    if (!user.passwordHash) {
      return res.status(401).json({ 
        error: 'Usuario no configurado. Contacta al administrador.' 
      });
    }
    
    // Verify password (temp or real)
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // First-time setup required - need to validate email with OTP
    if (user.passwordSetupRequired) {
      return res.status(200).json({
        setupRequired: true,
        username: user.username,
        message: 'Primer inicio de sesión - ingresa tu email para validación'
      });
    }
    
    // Check device trust via cookie
    const deviceToken = req.cookies?.[authService.DEVICE_COOKIE_NAME];
    const isTrusted = await authService.isDeviceTrusted(user.id, deviceToken);
    
    if (isTrusted) {
      // Trusted device - issue token directly
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role, 
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // New device - check if blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ 
        error: `Demasiados intentos. Espera ${waitMinutes} minutos.` 
      });
    }
    
    // Send OTP
    try {
      const otp = await authService.createOTPToken(user.id, 'login');
      await authService.sendOTPEmail(user.email, otp, user.username, 'login');
      
      // Create pending token for OTP verification
      const otpPendingToken = jwt.sign(
        { userId: user.id, purpose: 'login-otp', resendCount: 0 },
        process.env.JWT_SECRET,
        { expiresIn: `${authService.OTP_EXPIRY_MINUTES}m` }
      );
      
      return res.status(200).json({
        otpRequired: true,
        otpPendingToken,
        email: maskEmail(user.email),
        expiresIn: authService.OTP_EXPIRY_MINUTES * 60,
        message: 'Código de verificación enviado a tu email'
      });
    } catch (emailError) {
      console.error('Failed to send OTP:', emailError);
      return res.status(500).json({ 
        error: 'Error al enviar código de verificación' 
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/initiate-setup
 * User provides email, we send OTP to validate it
 */
const initiateSetup = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username y email son requeridos' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    const user = await prisma.users.findUnique({
      where: { username }
    });
    
    if (!user || !user.passwordSetupRequired) {
      return res.status(400).json({ error: 'Setup no disponible para este usuario' });
    }
    
    // Check if email already in use
    const existingEmail = await prisma.users.findUnique({
      where: { email }
    });
    if (existingEmail && existingEmail.id !== user.id) {
      return res.status(400).json({ error: 'Este email ya está en uso' });
    }
    
    // Check if user is blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ 
        error: `Demasiados intentos. Espera ${waitMinutes} minutos.` 
      });
    }
    
    // Temporarily save email (will be confirmed after OTP)
    await prisma.users.update({
      where: { id: user.id },
      data: { email }
    });
    
    // Generate and send OTP
    const otp = await authService.createOTPToken(user.id, 'setup');
    await authService.sendOTPEmail(email, otp, username, 'setup');
    
    // Create pending token for next step
    const setupToken = jwt.sign(
      { userId: user.id, purpose: 'setup-otp', email, resendCount: 0 },
      process.env.JWT_SECRET,
      { expiresIn: `${authService.OTP_EXPIRY_MINUTES}m` }
    );
    
    res.status(200).json({
      success: true,
      setupToken,
      message: 'Código de verificación enviado a tu email',
      expiresIn: authService.OTP_EXPIRY_MINUTES * 60 // seconds
    });
    
  } catch (error) {
    console.error('Initiate setup error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/verify-setup-otp
 * Verify OTP for email validation during first-time setup
 */
const verifySetupOTP = async (req, res) => {
  try {
    const { setupToken, otp } = req.body;
    
    if (!setupToken || !otp) {
      return res.status(400).json({ error: 'Token y código OTP requeridos' });
    }
    
    // Validate OTP format (8 digits)
    if (!/^\d{8}$/.test(otp)) {
      return res.status(400).json({ error: 'Código debe ser de 8 dígitos' });
    }
    
    // Verify setup token
    let decoded;
    try {
      decoded = jwt.verify(setupToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'setup-otp') {
        throw new Error('Invalid token purpose');
      }
    } catch {
      return res.status(401).json({ error: 'Token expirado o inválido' });
    }
    
    // Verify OTP using service
    const result = await authService.verifyOTPToken(decoded.userId, otp, 'setup');
    
    if (result.blocked) {
      if (result.justBlocked) {
        return res.status(429).json({ 
          error: `Código incorrecto. Has sido bloqueado por ${authService.OTP_BLOCK_MINUTES} minutos.` 
        });
      }
      return res.status(429).json({ 
        error: `Demasiados intentos. Intenta más tarde.` 
      });
    }
    
    if (result.expired) {
      return res.status(401).json({ error: 'Código expirado. Solicita uno nuevo.' });
    }
    
    if (!result.valid) {
      return res.status(401).json({ 
        error: `Código incorrecto, te quedan ${result.attemptsRemaining} intento${result.attemptsRemaining === 1 ? '' : 's'}`,
        hint: 'Revisa tu bandeja de spam'
      });
    }
    
    // Create token for password setup step
    const passwordSetupToken = jwt.sign(
      { userId: decoded.userId, purpose: 'password-setup', emailVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // 10 minutes to set password
    );
    
    res.status(200).json({
      success: true,
      passwordSetupToken,
      message: 'Email verificado. Ahora configura tu contraseña.'
    });
    
  } catch (error) {
    console.error('Verify setup OTP error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/complete-setup
 * Set new password and complete first-time setup
 */
const completeSetup = async (req, res) => {
  try {
    const { passwordSetupToken, password, confirmPassword } = req.body;
    
    if (!passwordSetupToken || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Contraseña no cumple los requisitos',
        details: passwordValidation.errors
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(passwordSetupToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password-setup' || !decoded.emailVerified) {
        throw new Error('Invalid token');
      }
    } catch {
      return res.status(401).json({ error: 'Token expirado. Inicia el proceso nuevamente.' });
    }
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // Hash new password and complete setup
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    await prisma.users.update({
      where: { id: user.id },
      data: {
        passwordHash,
        tempPassword: null, // Clear temp password
        passwordSetupRequired: false
      }
    });
    
    // Don't issue token here - per CONTEXT.md, user should return to login
    res.status(200).json({
      success: true,
      message: 'Contraseña configurada exitosamente. Por favor inicia sesión.',
      redirectTo: '/login'
    });
    
  } catch (error) {
    console.error('Complete setup error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/verify-login-otp
 * Verify OTP for login, optionally trust device
 */
const verifyLoginOTP = async (req, res) => {
  try {
    const { otpPendingToken, otp, trustDevice } = req.body;
    
    if (!otpPendingToken || !otp) {
      return res.status(400).json({ error: 'Token y código OTP requeridos' });
    }
    
    // Validate OTP format (8 digits)
    if (!/^\d{8}$/.test(otp)) {
      return res.status(400).json({ error: 'Código debe ser de 8 dígitos' });
    }
    
    // Verify pending token
    let decoded;
    try {
      decoded = jwt.verify(otpPendingToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'login-otp') {
        throw new Error('Invalid token purpose');
      }
    } catch {
      return res.status(401).json({ error: 'Token expirado - inicia sesión nuevamente' });
    }
    
    // Verify OTP
    const result = await authService.verifyOTPToken(decoded.userId, otp, 'login');
    
    if (result.blocked) {
      if (result.justBlocked) {
        return res.status(429).json({ 
          error: `Código incorrecto. Has sido bloqueado por ${authService.OTP_BLOCK_MINUTES} minutos.` 
        });
      }
      return res.status(429).json({ 
        error: `Demasiados intentos. Intenta más tarde.` 
      });
    }
    
    if (result.expired) {
      return res.status(401).json({ error: 'Código expirado. Solicita uno nuevo.' });
    }
    
    if (!result.valid) {
      return res.status(401).json({ 
        error: `Código incorrecto, te quedan ${result.attemptsRemaining} intento${result.attemptsRemaining === 1 ? '' : 's'}`,
        hint: 'Revisa tu bandeja de spam'
      });
    }
    
    // OTP valid - get user
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // Trust device if requested (per CONTEXT.md: checkbox explicit)
    if (trustDevice) {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const deviceToken = await authService.createTrustedDevice(user.id, userAgent, ipAddress);
      
      // Set httpOnly cookie
      res.cookie(
        authService.DEVICE_COOKIE_NAME,
        deviceToken,
        authService.DEVICE_COOKIE_OPTIONS
      );
    }
    
    // Generate access token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      deviceTrusted: !!trustDevice,
      message: trustDevice 
        ? 'Sesión iniciada. Dispositivo guardado por 30 días.' 
        : 'Sesión iniciada.'
    });
    
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/resend-otp
 * Resend OTP with progressive cooldowns per CONTEXT.md
 */
const resendOTP = async (req, res) => {
  try {
    const { otpPendingToken } = req.body;
    
    if (!otpPendingToken) {
      return res.status(400).json({ error: 'Token requerido' });
    }
    
    // Verify pending token
    let decoded;
    try {
      decoded = jwt.verify(otpPendingToken, process.env.JWT_SECRET);
      if (!['login-otp', 'setup-otp'].includes(decoded.purpose)) {
        throw new Error('Invalid token purpose');
      }
    } catch {
      return res.status(401).json({ error: 'Token expirado - inicia sesión nuevamente' });
    }
    
    const resendCount = decoded.resendCount || 0;
    
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // Check if blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.otpBlockedUntil - new Date()) / 60000);
      return res.status(429).json({ 
        error: `Demasiados intentos. Espera ${waitMinutes} minutos.` 
      });
    }
    
    // Determine purpose from token
    const purpose = decoded.purpose === 'setup-otp' ? 'setup' : 'login';
    
    // Generate and send new OTP
    const otp = await authService.createOTPToken(user.id, purpose);
    await authService.sendOTPEmail(user.email, otp, user.username, purpose);
    
    // Create new pending token with incremented resend count
    const newOtpPendingToken = jwt.sign(
      { 
        userId: user.id, 
        purpose: decoded.purpose,
        resendCount: resendCount + 1,
        email: decoded.email
      },
      process.env.JWT_SECRET,
      { expiresIn: `${authService.OTP_EXPIRY_MINUTES}m` }
    );
    
    // Calculate next cooldown
    const nextCooldown = authService.getResendCooldown(resendCount + 1);
    
    res.status(200).json({
      success: true,
      otpPendingToken: newOtpPendingToken,
      email: maskEmail(user.email),
      message: 'Nuevo código enviado',
      nextResendIn: nextCooldown // seconds until next resend allowed
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/logout-all
 * Revoke all trusted devices for current user
 */
const logoutAll = async (req, res) => {
  try {
    // Requires authentication
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const count = await authService.revokeAllDevices(req.user.userId);
    
    // Clear current device cookie
    res.clearCookie(authService.DEVICE_COOKIE_NAME);
    
    res.status(200).json({
      success: true,
      message: `${count} dispositivo${count === 1 ? '' : 's'} desconectado${count === 1 ? '' : 's'}`
    });
    
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export {
  login,
  initiateSetup,
  verifySetupOTP,
  completeSetup,
  verifyLoginOTP,
  resendOTP,
  logoutAll
};
