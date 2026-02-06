// src/pages/CategoriesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as categoriesApi from '../api/categories';

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesApi.getCategories(token);
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      const newCategory = await categoriesApi.createCategory(token, newCategoryName.trim());
      setCategories(prev => [...prev, newCategory].sort((a, b) => 
        a.category.localeCompare(b.category)
      ));
      setNewCategoryName('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEditing(category) {
    setEditingId(category.id);
    setEditingName(category.category);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName('');
  }

  async function saveEditing() {
    if (!editingName.trim()) {
      cancelEditing();
      return;
    }

    const originalCategory = categories.find(c => c.id === editingId);
    if (editingName.trim() === originalCategory?.category) {
      cancelEditing();
      return;
    }

    try {
      const updated = await categoriesApi.updateCategory(token, editingId, editingName.trim());
      setCategories(prev => 
        prev.map(c => c.id === editingId ? updated : c)
          .sort((a, b) => a.category.localeCompare(b.category))
      );
      cancelEditing();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }

  async function handleDelete(category) {
    const hasProducts = category.productCount > 0;
    const message = hasProducts
      ? `¿Eliminar "${category.category}"? Esta categoría tiene ${category.productCount} producto(s) asignados. Los productos no serán eliminados, solo perderán esta categoría.`
      : `¿Eliminar "${category.category}"?`;

    if (!confirm(message)) return;

    try {
      await categoriesApi.deleteCategory(token, category.id);
      setCategories(prev => prev.filter(c => c.id !== category.id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-[#262011]/60">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadCategories}
          className="px-4 py-2 bg-[#262011] text-white rounded hover:bg-[#262011]/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-xl font-bold text-[#262011]">
        Categorías ({categories.length})
      </h2>

      {/* Add new category form */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded text-base min-h-[48px]"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !newCategoryName.trim()}
            className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
          >
            {creating ? 'Creando...' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-[#262011]/60">
            No hay categorías. Crea la primera arriba.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#262011]/60">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[#262011]/60 w-24">Productos</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[#262011]/60 w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={saveEditing}
                        onKeyDown={handleEditKeyDown}
                        className="px-3 py-2 border border-[#262011] rounded text-base w-full max-w-xs"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(category)}
                        className="text-left font-medium text-[#262011] hover:text-[#262011]/70"
                        title="Click para editar"
                      >
                        {category.category}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#262011]/60">
                    {category.productCount} prod.
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId !== category.id && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="px-3 py-1 text-sm text-[#262011]/60 hover:text-[#262011] min-h-[36px]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded min-h-[36px]"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info note */}
      <div className="text-sm text-[#262011]/60 px-2">
        Las categorías también se pueden crear desde el formulario de productos.
        Las categorías sin productos se eliminarán automáticamente.
      </div>
    </div>
  );
}
