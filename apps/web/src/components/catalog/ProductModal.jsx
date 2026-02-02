// src/components/catalog/ProductModal.jsx
import { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { formatCLP } from "../../helpers/formatPrice.helper";

/**
 * Modal to display product details with auto-sliding images
 * @param {Object} product - Product data
 * @param {boolean} open - Modal visibility
 * @param {Function} onClose - Close handler
 * @param {boolean} showPrices - Whether to display prices
 */
export const ProductModal = ({ product, open, onClose, showPrices = true }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // Get all images or fallback to url_img
  const images = product?.images?.length > 0 
    ? product.images 
    : (product?.url_img ? [product.url_img] : []);

  // Reset to first image when modal opens or product changes
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
      setIsTransitioning(false);
    }
  }, [open, product?.id]);

  // Auto-slide every 3 seconds when modal is open and has multiple images
  useEffect(() => {
    if (!open || images.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      
      // After transition starts, update the index
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, images.length]);

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
        {/* Product Image Slider */}
        <div className="w-full aspect-square rounded-[30px] overflow-hidden mb-4 relative">
          {images.length > 0 ? (
            <>
              <div 
                className="w-full h-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)',
                }}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={product.product}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        idx === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Descripcion</h3>
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
