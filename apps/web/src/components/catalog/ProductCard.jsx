// src/components/catalog/ProductCard.jsx
import { Button } from "antd";
import { useSelection } from "../../hooks/useSelection";
import { QuantityControl } from "./QuantityControl";
import { formatCLP } from "../../helpers/formatPrice.helper";

/**
 * Product card for catalog grid with selection controls
 * @param {Object} product - Product data
 * @param {boolean} showPrices - Whether to display prices (from store config)
 * @param {Function} onProductClick - Callback when product is clicked (opens modal)
 */
export const ProductCard = ({ product, showPrices = true, onProductClick }) => {
  const { addToSelection, updateQuantity, removeFromSelection, getSelectedItem } = useSelection();
  
  const selectedItem = getSelectedItem(product.id);
  const isSelected = !!selectedItem;
  const isOutOfStock = !product.available;

  const handleCardClick = () => {
    if (onProductClick && !isOutOfStock) {
      onProductClick(product);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToSelection(product, 1);
  };

  const handleIncrease = () => {
    updateQuantity(product.id, selectedItem.quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, selectedItem.quantity - 1);
  };

  const handleRemove = () => {
    removeFromSelection(product.id);
  };

  // Out of stock product rendering
  if (isOutOfStock) {
    return (
      <div className="p-2 sm:p-4 opacity-50 grayscale cursor-not-allowed">
        <div className="relative bg-white w-full aspect-square flex items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${product.url_img})` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start mt-2 px-1 sm:px-2 gap-1">
          <p className="font-semibold text-sm sm:text-lg line-clamp-2 h-[2.5em] sm:h-[2.75em] leading-tight">{product.product}</p>
          <span className="text-gray-500 text-xs sm:text-sm font-medium flex-shrink-0 sm:leading-tight">Agotado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 hover:bg-gray-100 transition duration-200 rounded-xl sm:rounded-2xl">
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="relative bg-white w-full aspect-square flex items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${product.url_img})` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start mt-2 px-1 sm:px-2 gap-1">
          <p className="font-semibold text-sm sm:text-lg line-clamp-2 h-[2.5em] sm:h-[2.75em] leading-tight">{product.product}</p>
          {showPrices && <p className="text-black text-sm sm:text-base flex-shrink-0 sm:leading-tight">{formatCLP(product.price)}</p>}
        </div>
      </div>
      
      {/* Selection controls */}
      <div className="mt-2 sm:mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
        {isSelected ? (
          <QuantityControl
            quantity={selectedItem.quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            size="middle"
          />
        ) : (
          <Button
            type="primary"
            onClick={handleAddClick}
            className="!bg-[#262011] hover:!bg-[#3d3018] w-full"
          >
            Agregar
          </Button>
        )}
      </div>
    </div>
  );
};
