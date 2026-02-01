// src/pages/LoginPage.jsx
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function LoginPage() {
  const { saveAuth } = useAuth();
  const turnstileRef = useRef(null);
  
  // Steps: 'login' | 'setup-email' | 'setup-otp' | 'setup-password' | 'login-otp'
  const [step, setStep] = useState('login');
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState(null);
  
  // Tokens
  const [setupToken, setSetupToken] = useState(null);
  const [passwordSetupToken, setPasswordSetupToken] = useState(null);
  const [otpPendingToken, setOtpPendingToken] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resetTurnstile = () => {
    turnstileRef.current?.reset();
    setTurnstileToken(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authApi.login(username, password, turnstileToken);
      
      if (result.error) {
        setError(result.error);
        if (result.turnstileError || result.turnstileRequired) {
          resetTurnstile();
        }
        return;
      }
      
      if (result.setupRequired) {
        setStep('setup-email');
        setSuccess(result.message);
        return;
      }
      
      if (result.otpRequired) {
        setOtpPendingToken(result.otpPendingToken);
        setMaskedEmail(result.email);
        setStep('login-otp');
        setSuccess(result.message);
        return;
      }
      
      if (result.success) {
        saveAuth(result.token, result.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authApi.initiateSetup(username, email);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setSetupToken(result.setupToken);
      setStep('setup-otp');
      setSuccess(result.message);
    } catch (err) {
      console.error('Setup error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetupOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authApi.verifySetupOTP(setupToken, otp);
      
      if (result.error) {
        setError(result.error);
        if (result.hint) {
          setError(prev => `${prev}. ${result.hint}`);
        }
        return;
      }
      
      setPasswordSetupToken(result.passwordSetupToken);
      setOtp('');
      setStep('setup-password');
      setSuccess(result.message);
    } catch (err) {
      console.error('OTP error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authApi.completeSetup(passwordSetupToken, newPassword, confirmPassword);
      
      if (result.error) {
        if (result.details) {
          setError(result.details.join('. '));
        } else {
          setError(result.error);
        }
        return;
      }
      
      // Per CONTEXT.md: return to login after setup
      setStep('login');
      setPassword('');
      setSuccess(result.message);
      resetTurnstile();
    } catch (err) {
      console.error('Complete setup error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await authApi.verifyLoginOTP(otpPendingToken, otp, trustDevice);
      
      if (result.error) {
        setError(result.error);
        if (result.hint) {
          setError(prev => `${prev}. ${result.hint}`);
        }
        return;
      }
      
      saveAuth(result.token, result.user);
    } catch (err) {
      console.error('OTP error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setLoading(true);
    
    try {
      const token = step === 'setup-otp' ? setupToken : otpPendingToken;
      const result = await authApi.resendOTP(token);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (step === 'setup-otp') {
        setSetupToken(result.otpPendingToken);
      } else {
        setOtpPendingToken(result.otpPendingToken);
      }
      
      setSuccess(result.message);
      setResendCooldown(result.nextResendIn || 30);
    } catch (err) {
      console.error('Resend error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    setSuccess('');
    setOtp('');
    
    if (step === 'setup-email' || step === 'login-otp') {
      setStep('login');
      resetTurnstile();
    } else if (step === 'setup-otp') {
      setStep('setup-email');
    } else if (step === 'setup-password') {
      setStep('setup-otp');
    }
  };

  // Render helper for inline errors
  const renderError = () => error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {error}
    </div>
  );

  const renderSuccess = () => success && !error && (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
      {success}
    </div>
  );

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5E1A4] focus:border-transparent outline-none text-base";
  const buttonClass = "w-full py-3 bg-[#262011] text-[#F5E1A4] rounded-lg font-medium hover:bg-[#262011]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]";
  const linkButtonClass = "text-[#262011]/70 hover:text-[#262011] text-sm disabled:opacity-50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8E8] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#262011]">La Pan Comido</h1>
          <p className="text-[#262011]/60 mt-1 text-sm">Panel de Administración</p>
        </div>

        {renderError()}
        {renderSuccess()}

        {/* Login Form */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="dev o admin"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Tu contraseña"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            {/* Turnstile Captcha */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onError={() => setError('Error de verificación. Recarga la página.')}
                />
              </div>
            )}
            
            <button type="submit" disabled={loading || (TURNSTILE_SITE_KEY && !turnstileToken)} className={buttonClass}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* Setup Email Form */}
        {step === 'setup-email' && (
          <form onSubmit={handleInitiateSetup} className="space-y-4">
            <p className="text-sm text-[#262011]/70 mb-2">
              Ingresa tu email para recibir el código de verificación.
            </p>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
            <button type="button" onClick={goBack} className={`w-full ${linkButtonClass}`} disabled={loading}>
              Volver
            </button>
          </form>
        )}

        {/* Setup OTP Form */}
        {step === 'setup-otp' && (
          <form onSubmit={handleVerifySetupOTP} className="space-y-4">
            <p className="text-sm text-[#262011]/70 mb-2">
              Ingresa el código de 8 dígitos enviado a tu email.
            </p>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Código</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
                placeholder="00000000"
                maxLength={8}
                required
                disabled={loading}
                inputMode="numeric"
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 8} className={buttonClass}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            <div className="flex justify-between">
              <button type="button" onClick={handleResendOTP} disabled={loading || resendCooldown > 0} className={linkButtonClass}>
                {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
              </button>
              <button type="button" onClick={goBack} className={linkButtonClass} disabled={loading}>
                Volver
              </button>
            </div>
          </form>
        )}

        {/* Setup Password Form */}
        {step === 'setup-password' && (
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <p className="text-sm text-[#262011]/70 mb-2">
              Crea una contraseña segura (8+ caracteres, mayúscula, minúscula, número, símbolo).
            </p>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="********"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="********"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </form>
        )}

        {/* Login OTP Form with Trust Checkbox */}
        {step === 'login-otp' && (
          <form onSubmit={handleVerifyLoginOTP} className="space-y-4">
            <p className="text-sm text-[#262011]/70 mb-2">
              Código enviado a <strong>{maskedEmail}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-[#262011] mb-1">Código</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
                placeholder="00000000"
                maxLength={8}
                required
                disabled={loading}
                inputMode="numeric"
              />
            </div>
            
            {/* Trust Device Checkbox - Per CONTEXT.md */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#262011] focus:ring-[#F5E1A4]"
              />
              <span className="text-sm text-[#262011]">
                Confiar en este dispositivo por 30 días
              </span>
            </label>
            
            <button type="submit" disabled={loading || otp.length !== 8} className={buttonClass}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            <div className="flex justify-between">
              <button type="button" onClick={handleResendOTP} disabled={loading || resendCooldown > 0} className={linkButtonClass}>
                {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
              </button>
              <button type="button" onClick={goBack} className={linkButtonClass} disabled={loading}>
                Volver
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
