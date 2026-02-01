// src/api/config.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth headers with token
 */
function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get store configuration
 */
export async function getConfig(token) {
  const response = await fetch(`${API_URL}/api/admin/config`, {
    method: 'GET',
    headers: getAuthHeaders(token),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar configuración');
  }
  return response.json();
}

/**
 * Update store configuration
 */
export async function updateConfig(token, data) {
  const response = await fetch(`${API_URL}/api/admin/config`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar configuración');
  }
  return response.json();
}

export default {
  getConfig,
  updateConfig,
};
