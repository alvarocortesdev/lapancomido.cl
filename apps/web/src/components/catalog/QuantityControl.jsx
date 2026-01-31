// src/components/catalog/QuantityControl.jsx
import { Button } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

/**
 * Reusable quantity control with +/- buttons
 * @param {number} quantity - Current quantity
 * @param {function} onIncrease - Called when + clicked
 * @param {function} onDecrease - Called when - clicked (only if quantity > 1)
 * @param {function} onRemove - Called when quantity would go below 1
 * @param {string} size - Button size: "small" | "middle" | "large"
 */
export const QuantityControl = ({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  onRemove,
  size = "small" 
}) => {
  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity === 1) {
      onRemove?.();
    } else {
      onDecrease?.();
    }
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onIncrease?.();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="default"
        size={size}
        icon={<MinusOutlined />}
        onClick={handleDecrease}
        className="!bg-[#F5E1A4] hover:!bg-[#e6d294] !w-9 !h-9 !min-w-[36px] !p-0 flex items-center justify-center"
      />
      <span className="min-w-[24px] text-center font-semibold">{quantity}</span>
      <Button
        type="default"
        size={size}
        icon={<PlusOutlined />}
        onClick={handleIncrease}
        className="!bg-[#F5E1A4] hover:!bg-[#e6d294] !w-9 !h-9 !min-w-[36px] !p-0 flex items-center justify-center"
      />
    </div>
  );
};
