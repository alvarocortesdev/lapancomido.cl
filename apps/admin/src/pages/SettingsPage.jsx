// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';
import * as configApi from '../api/config';

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Store config state
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configError, setConfigError] = useState('');
  const [configSuccess, setConfigSuccess] = useState('');
  const [config, setConfig] = useState({
    whatsapp_number: '',
    greeting: '',
    show_prices: true,
  });

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadConfig() {
    try {
      setConfigLoading(true);
      setConfigError('');
      const data = await configApi.getConfig(token);
      setConfig({
        whatsapp_number: data.whatsapp_number || '',
        greeting: data.greeting || '',
        show_prices: data.show_prices ?? true,
      });
    } catch (err) {
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    try {
      setConfigSaving(true);
      setConfigError('');
      setConfigSuccess('');
      await configApi.updateConfig(token, config);
      setConfigSuccess('Configuración guardada');
      setTimeout(() => setConfigSuccess(''), 3000);
    } catch (err) {
      setConfigError(err.message);
    } finally {
      setConfigSaving(false);
    }
  }

  function handleConfigChange(field, value) {
    setConfig(prev => ({ ...prev, [field]: value }));
    setConfigSuccess(''); // Clear success when editing
  }

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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#262011]">Configuración</h1>
      
      {/* Store Config */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#262011] mb-4">Tienda</h2>
        
        {configLoading ? (
          <div className="text-[#262011]/60">Cargando configuración...</div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            {configError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {configError}
              </div>
            )}
            
            {configSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {configSuccess}
              </div>
            )}

            {/* Show Prices Toggle */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <label className="font-medium text-[#262011]">Mostrar precios</label>
                <p className="text-sm text-[#262011]/60">
                  Los precios serán visibles en el catálogo público
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleConfigChange('show_prices', !config.show_prices)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  config.show_prices ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span 
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    config.show_prices ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block font-medium text-[#262011] mb-1">
                Número de WhatsApp
              </label>
              <p className="text-sm text-[#262011]/60 mb-2">
                Número para recibir consultas (formato: 56912345678)
              </p>
              <input
                type="text"
                value={config.whatsapp_number}
                onChange={e => handleConfigChange('whatsapp_number', e.target.value)}
                placeholder="56912345678"
                className="w-full px-4 py-3 border border-gray-200 rounded text-base min-h-[48px]"
              />
            </div>

            {/* Greeting */}
            <div>
              <label className="block font-medium text-[#262011] mb-1">
                Mensaje de saludo
              </label>
              <p className="text-sm text-[#262011]/60 mb-2">
                Mensaje predeterminado en WhatsApp
              </p>
              <textarea
                value={config.greeting}
                onChange={e => handleConfigChange('greeting', e.target.value)}
                placeholder="Hola! Hay pan? <3"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded text-base"
              />
            </div>

            <button
              type="submit"
              disabled={configSaving}
              className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
            >
              {configSaving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </form>
        )}
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
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
