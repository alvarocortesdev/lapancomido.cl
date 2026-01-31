// src/components/catalog/ProductModal.jsx
import { Modal } from "antd";
import { formatCLP } from "../../helpers/formatPrice.helper";

/**
 * Simple modal to display product details
 * @param {Object} product - Product data
 * @param {boolean} open - Modal visibility
 * @param {Function} onClose - Close handler
 * @param {boolean} showPrices - Whether to display prices
 */
export const ProductModal = ({ product, open, onClose, showPrices = true }) => {
  if (!product) return null;

  // Get category from product
  const category = product.categories?.[0] || product.category || null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="product-modal"
    >
      <div className="flex flex-col">
        {/* Product Image */}
        <div className="w-full aspect-square rounded-[30px] overflow-hidden mb-4">
          {product.url_img ? (
            <img
              src={product.url_img}
              alt={product.product}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Category */}
        {category && (
          <span className="inline-block bg-[#F5E1A4] text-[#262011] text-xs font-medium px-2 py-1 rounded-full mb-2 w-fit">
            {category}
          </span>
        )}

        {/* Product Name */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#262011] mb-2">
          {product.product}
        </h2>

        {/* Price */}
        {showPrices && (
          <p className="text-lg sm:text-xl font-semibold text-[#262011] mb-4">
            {formatCLP(product.price)}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Descripción</h3>
            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Availability */}
        <p
          className={`text-sm font-medium ${
            product.available !== false ? "text-green-600" : "text-gray-500"
          }`}
        >
          {product.available !== false ? "Disponible" : "No disponible"}
        </p>
      </div>
    </Modal>
  );
};
