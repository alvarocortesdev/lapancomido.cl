// src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as productsApi from '../api/products';

export default function ProductsPage({ onEdit, onCreate }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getProducts(token);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id) {
    try {
      const result = await productsApi.toggleAvailability(token, id);
      setProducts(prev => 
        prev.map(p => p.id === id ? { ...p, available: result.available } : p)
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`¿Eliminar ${selectedIds.length} producto(s)?`)) return;
    
    try {
      setDeleting(true);
      await productsApi.deleteProducts(token, selectedIds);
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  }

  const filteredProducts = products.filter(p => 
    p.product.toLowerCase().includes(search.toLowerCase()) ||
    (p.categories || []).some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-[#262011]/60">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadProducts}
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-[#262011]">
          Productos ({products.length})
        </h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 min-h-[44px]"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Search and bulk actions */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded w-full sm:w-64 min-h-[44px] text-base"
          />
          {selectedIds.length > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
            >
              {deleting ? 'Eliminando...' : `Eliminar (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60">Imagen</th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60">Producto</th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60 hidden md:table-cell">Precio</th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60 hidden lg:table-cell">Categorías</th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60">Estado</th>
                <th className="p-4 text-left text-sm font-medium text-[#262011]/60">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-5 h-5"
                    />
                  </td>
                  <td className="p-4">
                    {product.url_img ? (
                      <img 
                        src={product.url_img} 
                        alt={product.product}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        Sin img
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[#262011]">{product.product}</div>
                    <div className="text-sm text-[#262011]/60 md:hidden">
                      ${Number(product.price).toLocaleString('es-CL')}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[#262011]">
                      ${Number(product.price).toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(product.categories || []).slice(0, 2).map(cat => (
                        <span 
                          key={cat}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {cat}
                        </span>
                      ))}
                      {(product.categories || []).length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{product.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(product.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        product.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {product.available ? 'Disponible' : 'Agotado'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onEdit(product)}
                      className="px-3 py-1 bg-[#262011] text-white rounded text-sm hover:bg-[#262011]/90 min-h-[36px]"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-[#262011]/60">
            {search ? 'No se encontraron productos' : 'No hay productos'}
          </div>
        )}
      </div>
    </div>
  );
}
