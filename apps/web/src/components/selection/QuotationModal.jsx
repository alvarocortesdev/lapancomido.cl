// src/components/selection/QuotationModal.jsx
import { useState } from "react";
import { Modal, Input, Button, Form, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import PhoneInput from "react-phone-number-input";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import es from "react-phone-number-input/locale/es";
import "react-phone-number-input/style.css";

import { useSelection } from "../../hooks/useSelection";
import { formatCLP } from "../../helpers/formatPrice.helper";
import { generateWhatsAppLink } from "../../helpers/whatsapp.helper";
import { QuantityControl } from "../catalog/QuantityControl";

const { TextArea } = Input;

/**
 * Quotation modal with customer form and WhatsApp submission
 * @param {boolean} open - Modal visibility
 * @param {function} onClose - Called when modal closes
 * @param {Object} storeConfig - Store configuration (whatsapp_number, greeting, show_prices)
 */
export const QuotationModal = ({ open, onClose, storeConfig }) => {
  const { 
    selection, 
    totalPrice, 
    updateQuantity, 
    removeFromSelection,
    clearSelection 
  } = useSelection();
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    comment: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Nombre requerido";
    }
    
    if (!form.phone) {
      newErrors.phone = "Celular requerido";
    } else if (!isPossiblePhoneNumber(form.phone)) {
      newErrors.phone = "Celular inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCustomerLead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/store/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone,
          email: form.email.trim() || null
        })
      });
    } catch (error) {
      // Don't block the WhatsApp flow if lead save fails
      console.error("Failed to save customer lead:", error);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (selection.length === 0) {
      message.warning("No hay productos seleccionados");
      return;
    }

    setSubmitting(true);

    try {
      // Save customer email for future promotions (async, don't block)
      saveCustomerLead();

      // Generate WhatsApp link
      const link = generateWhatsAppLink(storeConfig.whatsapp_number, {
        customerName: form.name.trim(),
        customerPhone: form.phone,
        products: selection,
        greeting: storeConfig.greeting,
        showPrices: storeConfig.show_prices,
        comment: form.comment.trim()
      });

      // Open WhatsApp in new tab
      window.open(link, "_blank");

      // Clear selection and close modal
      clearSelection();
      setForm({ name: "", phone: "", email: "", comment: "" });
      onClose();
      
      message.success("Redirigiendo a WhatsApp...");
    } catch (error) {
      console.error("Failed to generate WhatsApp link:", error);
      message.error("Error al generar enlace de WhatsApp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title="Cotización"
      open={open}
      onCancel={handleCancel}
      width="95%"
      style={{ maxWidth: 600 }}
      centered
      footer={[
        <Button key="cancel" onClick={handleCancel} className="hidden sm:inline-block">
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          className="!bg-green-600 !border-green-600 hover:!bg-green-700 w-full sm:w-auto"
          disabled={selection.length === 0}
        >
          Consultar por stock
        </Button>
      ]}
    >
      {/* Product Summary */}
      <div className="mb-4 sm:mb-6">
        <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Productos seleccionados</h4>
        <div className="max-h-[150px] sm:max-h-[200px] overflow-y-auto space-y-2 bg-gray-50 p-2 sm:p-3 rounded-lg">
          {selection.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 sm:gap-3 bg-white p-2 rounded"
            >
              <img
                src={item.url_img}
                alt={item.product}
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-xs sm:text-sm">{item.product}</p>
              </div>
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                onRemove={() => removeFromSelection(item.id)}
                size="small"
              />
              {storeConfig.show_prices && (
                <p className="font-semibold text-xs sm:text-sm min-w-[50px] sm:min-w-[60px] text-right">
                  {formatCLP(item.quantity * Number(item.price))}
                </p>
              )}
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFromSelection(item.id)}
                className="flex-shrink-0"
              />
            </div>
          ))}
        </div>
        {storeConfig.show_prices && (
          <div className="flex justify-end mt-2 pr-2">
            <span className="font-semibold">
              Total: {formatCLP(totalPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Customer Form */}
      <Form layout="vertical">
        <Form.Item
          label="Nombre completo"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name}
        >
          <Input
            placeholder="Tu nombre"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Celular"
          required
          validateStatus={errors.phone ? "error" : ""}
          help={errors.phone}
        >
          <PhoneInput
            international
            defaultCountry="CL"
            labels={es}
            value={form.phone}
            onChange={(phone) => handleChange("phone", phone || "")}
            placeholder="Ingresa tu celular"
            className="phone-input-custom"
          />
        </Form.Item>

        <Form.Item label="Email (opcional)">
          <Input
            type="email"
            placeholder="Para recibir promociones"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Comentarios (opcional)">
          <TextArea
            rows={2}
            placeholder="Instrucciones especiales, horario de entrega, etc."
            value={form.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
