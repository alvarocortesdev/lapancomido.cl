// src/utils/validation.js

/**
 * Validate password strength per CONTEXT.md requirements:
 * - 8+ characters
 * - At least 1 number
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 special character
 * 
 * @param {string} password
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos 1 número');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos 1 mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos 1 minúscula');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Debe incluir al menos 1 caracter especial (!@#$%^&*...)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export {
  validatePassword,
  validateEmail
};
