// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('@lapancomido/database');
const { validatePassword, validateEmail } = require('../utils/validation');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '30d';
const OTP_EXPIRY_MINUTES = 5; // Per CONTEXT.md
const OTP_MAX_ATTEMPTS = 3;
const OTP_BLOCK_MINUTES = 15;

/**
 * Generate 8-digit OTP (per CONTEXT.md)
 */
function generateOTP() {
  return crypto.randomInt(10000000, 99999999).toString();
}

/**
 * POST /auth/login
 * Step 1: Validate username + password (temp or real)
 * If setupRequired, return { setupRequired: true }
 * If normal login, proceed to device check (Plan 02)
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
    
    // Normal login - device check will be added in Plan 02
    // For now, return success with token
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
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/initiate-setup
 * Step 2: User provides email, we send OTP to validate it
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
    
    // Generate OTP (8 digits, 5 min expiry per CONTEXT.md)
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Invalidate previous OTPs
    await prisma.otp_tokens.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });
    
    // Create new OTP
    await prisma.otp_tokens.create({
      data: {
        userId: user.id,
        hashedCode: hashedOTP,
        purpose: 'setup',
        expiresAt,
        used: false
      }
    });
    
    // Temporarily save email (will be confirmed after OTP)
    await prisma.users.update({
      where: { id: user.id },
      data: { email }
    });
    
    // TODO: Send OTP via Resend (Plan 02)
    // For now, log it for development
    console.log(`[DEV] OTP for ${username}: ${otp}`);
    
    // Create pending token for next step
    const setupToken = jwt.sign(
      { userId: user.id, purpose: 'setup-otp', email },
      process.env.JWT_SECRET,
      { expiresIn: `${OTP_EXPIRY_MINUTES}m` }
    );
    
    res.status(200).json({
      success: true,
      setupToken,
      message: 'Código de verificación enviado a tu email',
      expiresIn: OTP_EXPIRY_MINUTES * 60 // seconds
    });
    
  } catch (error) {
    console.error('Initiate setup error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /auth/verify-setup-otp
 * Step 3: Verify OTP for email validation
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
    
    // Find valid OTP
    const otpToken = await prisma.otp_tokens.findFirst({
      where: {
        userId: user.id,
        purpose: 'setup',
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!otpToken) {
      return res.status(401).json({ error: 'Código expirado. Solicita uno nuevo.' });
    }
    
    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpToken.hashedCode);
    
    if (!isValid) {
      // Increment attempts
      const newAttempts = user.otpAttempts + 1;
      const updateData = { otpAttempts: newAttempts };
      
      // Block after 3 attempts (per CONTEXT.md)
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        updateData.otpBlockedUntil = new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000);
        updateData.otpAttempts = 0;
        
        await prisma.users.update({
          where: { id: user.id },
          data: updateData
        });
        
        return res.status(429).json({ 
          error: `Código incorrecto. Has sido bloqueado por ${OTP_BLOCK_MINUTES} minutos.` 
        });
      }
      
      await prisma.users.update({
        where: { id: user.id },
        data: updateData
      });
      
      const remaining = OTP_MAX_ATTEMPTS - newAttempts;
      return res.status(401).json({ 
        error: `Código incorrecto, te quedan ${remaining} intento${remaining === 1 ? '' : 's'}`,
        hint: 'Revisa tu bandeja de spam'
      });
    }
    
    // OTP valid - mark as used and reset attempts
    await prisma.otp_tokens.update({
      where: { id: otpToken.id },
      data: { used: true }
    });
    
    await prisma.users.update({
      where: { id: user.id },
      data: { otpAttempts: 0, otpBlockedUntil: null }
    });
    
    // Create token for password setup step
    const passwordSetupToken = jwt.sign(
      { userId: user.id, purpose: 'password-setup', emailVerified: true },
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
 * Step 4: Set new password and complete setup
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

module.exports = {
  login,
  initiateSetup,
  verifySetupOTP,
  completeSetup
};
