// src/components/selection/SelectionBar.jsx
import { useState } from "react";
import { Button } from "antd";
import { UpOutlined, DownOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelection } from "../../hooks/useSelection";
import { formatCLP } from "../../helpers/formatPrice.helper";
import { QuantityControl } from "../catalog/QuantityControl";

/**
 * Sticky bottom bar showing selection summary
 * @param {function} onQuoteClick - Called when Cotizar button is clicked
 * @param {boolean} showPrices - Whether to display prices (from store config)
 */
export const SelectionBar = ({ onQuoteClick, showPrices = true }) => {
  const {
    selection,
    totalItems,
    totalPrice,
    clearSelection,
    updateQuantity,
    removeFromSelection,
  } = useSelection();
  const [expanded, setExpanded] = useState(false);

  // Don't render if no items selected
  if (selection.length === 0) {
    return null;
  }

  const handleQuoteClick = (e) => {
    e.stopPropagation();
    onQuoteClick?.();
  };

  const handleClearClick = (e) => {
    e.stopPropagation();
    clearSelection();
    setExpanded(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#F5E1A4] rounded-xl z-50">
      {/* Expanded product list */}
      {expanded && (
        <div className="max-h-[40vh] overflow-y-auto p-3 sm:p-4 border-b border-[#262011]/20 bg-[#fff5da] rounded-t-xl">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className="font-semibold text-base sm:text-lg text-[#262011]">
              Productos seleccionados
            </h3>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearClick}
              size="small"
            >
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {selection.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 sm:gap-3 bg-[#F5E1A4] p-2 rounded-full border border-[#262011]/10"
              >
                <img
                  src={item.url_img}
                  alt={item.product}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm sm:text-base text-[#262011]">
                    {item.product}
                  </p>
                  {showPrices && (
                    <p className="text-xs sm:text-sm text-[#262011]/70">
                      {formatCLP(item.price)} c/u
                    </p>
                  )}
                </div>
                <QuantityControl
                  quantity={item.quantity}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeFromSelection(item.id)}
                  size="small"
                />
                {showPrices && (
                  <p className="font-semibold text-sm sm:text-base min-w-[60px] sm:min-w-[70px] mr-3 text-right text-[#262011]">
                    {formatCLP(item.quantity * Number(item.price))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main bar */}
      <div
        className="flex justify-between items-center p-3 sm:p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            type="text"
            icon={expanded ? <DownOutlined /> : <UpOutlined />}
            size="small"
            className="!px-1 sm:!px-2"
          />
          <div className="text-sm sm:text-base text-[#262011] bg-[#fff5da] pl-3 pr-5 sm:pr-6 py-1 rounded-lg">
            <span className="font-semibold">
              {totalItems} {totalItems === 1 ? "Producto" : "Productos"}
            </span>
            {showPrices && (
              <span className="ml-1 sm:ml-2 text-[#262011]/70">
                {formatCLP(totalPrice)}
              </span>
            )}
          </div>
        </div>
        <Button
          type="primary"
          size="middle"
          onClick={handleQuoteClick}
          className="!bg-[#262011] hover:!bg-[#3d3018] text-sm sm:text-base"
        >
          Cotizar
        </Button>
      </div>
    </div>
  );
};
