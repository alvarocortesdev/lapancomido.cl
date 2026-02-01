// src/pages/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogoutAll = async () => {
    if (!confirm('¿Cerrar sesión en todos los dispositivos? Tendrás que verificar con OTP la próxima vez.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const result = await authApi.logoutAll(token);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setMessage(result.message);
      
      // Logout current session after showing message
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      console.error('Logout all error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#262011] mb-6">Configuración</h1>
      
      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#262011] mb-4">Tu Cuenta</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-[#262011]/60">Usuario:</span> {user?.username}</p>
          <p><span className="text-[#262011]/60">Email:</span> {user?.email}</p>
          <p><span className="text-[#262011]/60">Rol:</span> {user?.role === 'developer' ? 'Desarrollador' : 'Administrador'}</p>
        </div>
      </div>
      
      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#262011] mb-4">Seguridad</h2>
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <p className="text-sm text-[#262011]/70 mb-4">
          Cierra sesión en todos tus dispositivos. La próxima vez que inicies sesión 
          desde cualquier dispositivo, necesitarás verificar con un código OTP.
        </p>
        
        <button
          onClick={handleLogoutAll}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {loading ? 'Cerrando sesiones...' : 'Cerrar todas las sesiones'}
        </button>
      </div>
    </div>
  );
}
