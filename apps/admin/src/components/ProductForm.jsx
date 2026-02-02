// src/components/ProductForm.jsx
import { useState, useEffect } from "react";
import ImageCropperModal from "./ImageCropperModal";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function ProductForm({
  product,
  categories = [],
  onSave,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    product: "",
    price: "",
    pack_size: "",
    unit_type: "unit",
    description: "",
    available: false,
    hidden: false,
    stock: 0,
    categories: [],
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [cropper, setCropper] = useState({
    isOpen: false,
    imageSrc: null,
    initialAspectRatio: 1,
    onComplete: null,
  });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);

  useEffect(() => {
    if (processingQueue && pendingFiles.length > 0 && !cropper.isOpen) {
      const file = pendingFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropper({
          isOpen: true,
          imageSrc: reader.result,
          initialAspectRatio: 1,
          onComplete: (blob) => handleQueueUpload(blob),
        });
      };
      reader.readAsDataURL(file);
    } else if (processingQueue && pendingFiles.length === 0) {
      setProcessingQueue(false);
      setUploading(false);
    }
  }, [pendingFiles, processingQueue, cropper.isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        product: product.product || "",
        price: product.price || "",
        pack_size: product.pack_size || "",
        unit_type: product.unit_type || "unit",
        description: product.description || "",
        available: product.available || false,
        hidden: product.hidden || false,
        stock: product.stock || 0,
        categories: product.categories || [],
        images: product.images || [],
      });
    }
  }, [product]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function handleCategoryToggle(category) {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }

  function handleAddCategory() {
    if (
      newCategory.trim() &&
      !formData.categories.includes(newCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory("");
    }
  }

  function handleRemoveCategory(category) {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  }

  async function handleQueueUpload(blob) {
    try {
      const file = new File([blob], "product-image.jpg", {
        type: "image/jpeg",
      });

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formDataUpload.append("folder", `productos/${product?.id || "new"}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formDataUpload },
      );

      if (!response.ok) throw new Error("Error al subir imagen");

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            secure_url: data.secure_url,
            public_id: data.public_id,
          },
        ],
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setPendingFiles((prev) => prev.slice(1));
      setCropper((prev) => ({ ...prev, isOpen: false }));
    }
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      alert(
        "Cloudinary no está configurado. Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.",
      );
      return;
    }

    // Reset input
    e.target.value = "";

    setUploading(true);
    setPendingFiles((prev) => [...prev, ...files]);
    setProcessingQueue(true);
  }

  function handleRemoveImage(index) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function validate() {
    const newErrors = {};

    if (!formData.product.trim()) {
      newErrors.product = "El nombre es requerido";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        price: Number(formData.price),
        pack_size: formData.pack_size ? Number(formData.pack_size) : null,
        stock: Number(formData.stock) || 0,
      });
    }
  }

  // Get all unique categories from existing products and add categories from DB
  const allCategories = [...new Set([...categories, ...formData.categories])];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#262011] mb-4">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#262011]/80 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
              className={`w-full px-4 py-3 border rounded text-base ${
                errors.product ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Ej: Pan de Masa Madre"
            />
            {errors.product && (
              <p className="text-red-500 text-sm mt-1">{errors.product}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#262011]/80 mb-1">
              Precio (CLP) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={`w-full px-4 py-3 border rounded text-base ${
                errors.price ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="2500"
              min="0"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#262011]/80 mb-1">
              Cantidad
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.pack_size}
                onChange={(e) => handleChange("pack_size", e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded text-base"
                placeholder="6"
                min="1"
              />
              <select
                value={formData.unit_type}
                onChange={(e) => handleChange("unit_type", e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded text-base bg-white min-w-[100px]"
              >
                <option value="unit">cant</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#262011]/80 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded text-base"
              rows={3}
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => handleChange("available", e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-[#262011]">
                Disponible
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hidden}
                onChange={(e) => handleChange("hidden", e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-[#262011]">
                Ocultar
              </span>
              <span className="text-xs text-[#262011]/50">
                (no visible en web)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#262011] mb-4">
          Categorías
        </h3>

        {/* Selected categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 bg-[#262011] text-[#F5E1A4] rounded flex items-center gap-2"
            >
              {cat}
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Available categories */}
        {allCategories.filter((c) => !formData.categories.includes(c)).length >
          0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {allCategories
              .filter((c) => !formData.categories.includes(c))
              .map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryToggle(cat)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  + {cat}
                </button>
              ))}
          </div>
        )}

        {/* Add new category */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddCategory())
            }
            className="flex-1 px-4 py-2 border border-gray-200 rounded text-base"
            placeholder="Nueva categoría..."
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 min-h-[44px]"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#262011] mb-4">Imágenes</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {formData.images.map((img, index) => (
            <div key={img.public_id || index} className="relative group">
              <img
                src={img.secure_url}
                alt={`Imagen ${index + 1}`}
                className="w-full aspect-square object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                  Principal
                </span>
              )}
            </div>
          ))}

          {/* Upload button */}
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <span className="text-gray-400 text-sm">Subiendo...</span>
            ) : (
              <>
                <span className="text-3xl text-gray-400 mb-1">+</span>
                <span className="text-gray-400 text-xs text-center px-2">
                  Subir imágenes
                </span>
              </>
            )}
          </label>
        </div>

        {!CLOUDINARY_CLOUD_NAME && (
          <p className="text-amber-600 text-sm">
            Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET
            para habilitar subida de imágenes.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 min-h-[48px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-3 bg-[#262011] text-[#F5E1A4] rounded font-medium hover:bg-[#262011]/90 disabled:opacity-50 min-h-[48px]"
        >
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
        </button>
      </div>
    </form>
  );
}
