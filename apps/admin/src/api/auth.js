// src/api/auth.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Login with username, password, and Turnstile token
 */
export async function login(username, password, turnstileToken) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // For cookies
    body: JSON.stringify({ username, password, turnstileToken })
  });
  return response.json();
}

/**
 * Initiate first-time setup (send OTP to email)
 */
export async function initiateSetup(username, email) {
  const response = await fetch(`${API_URL}/api/auth/initiate-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, email })
  });
  return response.json();
}

/**
 * Verify OTP for email validation during setup
 */
export async function verifySetupOTP(setupToken, otp) {
  const response = await fetch(`${API_URL}/api/auth/verify-setup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ setupToken, otp })
  });
  return response.json();
}

/**
 * Complete setup with new password
 */
export async function completeSetup(passwordSetupToken, password, confirmPassword) {
  const response = await fetch(`${API_URL}/api/auth/complete-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passwordSetupToken, password, confirmPassword })
  });
  return response.json();
}

/**
 * Verify OTP for login (new device)
 */
export async function verifyLoginOTP(otpPendingToken, otp, trustDevice) {
  const response = await fetch(`${API_URL}/api/auth/verify-login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ otpPendingToken, otp, trustDevice })
  });
  return response.json();
}

/**
 * Resend OTP
 */
export async function resendOTP(otpPendingToken) {
  const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ otpPendingToken })
  });
  return response.json();
}

/**
 * Logout all devices
 */
export async function logoutAll(token) {
  const response = await fetch(`${API_URL}/api/auth/logout-all`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  return response.json();
}

export default { 
  login, 
  initiateSetup, 
  verifySetupOTP, 
  completeSetup, 
  verifyLoginOTP, 
  resendOTP, 
  logoutAll 
};
