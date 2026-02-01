// src/middlewares/verifyTurnstile.js
/**
 * Verify Cloudflare Turnstile token
 * Per CONTEXT.md: Use Turnstile captcha on login
 */
async function verifyTurnstile(req, res, next) {
  const token = req.body.turnstileToken;
  
  // Skip in development if no secret configured
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn('[DEV] Turnstile verification skipped - no secret key');
    return next();
  }
  
  if (!token) {
    return res.status(400).json({ 
      error: 'Verificación de seguridad requerida',
      turnstileRequired: true 
    });
  }
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Turnstile verification failed:', result);
      return res.status(400).json({ 
        error: 'Verificación de seguridad fallida. Intenta de nuevo.',
        turnstileError: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Turnstile API error:', error);
    // Allow through on API error to not block users
    next();
  }
}

module.exports = verifyTurnstile;
