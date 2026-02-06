// src/pages/ProductEditPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import * as productsApi from '../api/products';

export default function ProductEditPage({ product, onBack, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategories() {
    try {
      const products = await productsApi.getProducts(token);
      const allCategories = products.flatMap(p => p.categories || []);
      setCategories([...new Set(allCategories)]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function handleSave(formData) {
    try {
      setLoading(true);
      await productsApi.updateProduct(token, product.id, formData);
      onSuccess?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-[#262011]/60 hover:text-[#262011]"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-[#262011]">
          Editar: {product.product}
        </h2>
      </div>

      <ProductForm
        product={product}
        categories={categories}
        onSave={handleSave}
        onCancel={onBack}
        loading={loading}
      />
    </div>
  );
}
