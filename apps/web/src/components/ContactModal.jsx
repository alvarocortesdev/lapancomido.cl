// src/components/ContactModal.jsx
import { useState } from "react";
import { Modal, Input, Select, Button } from "antd";
import { toast } from "react-toastify";

const { TextArea } = Input;

// Common country codes for Chile and surrounding countries
const countryCodes = [
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+1", country: "USA/Canadá", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
];

/**
 * Contact modal with form to send message via email (Resend)
 * @param {boolean} open - Modal visibility
 * @param {Function} onClose - Close handler
 */
export const ContactModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    countryCode: "+56",
    phone: "",
    message: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fullName.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }
    if (!form.phone.trim() || form.phone.length < 8) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Por favor ingresa un mensaje");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: `${form.countryCode} ${form.phone}`,
            message: form.message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }

      toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
      setForm({
        fullName: "",
        email: "",
        countryCode: "+56",
        phone: "",
        message: "",
      });
      onClose();
    } catch (error) {
      console.error("Error sending contact:", error);
      toast.error("Error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      title={
        <span className="text-xl font-bold text-[#262011]">Contáctanos</span>
      }
    >
      <div className="flex flex-col gap-4 pt-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <Input
            placeholder="Tu nombre completo"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            size="large"
            className="!text-base"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="large"
            className="!text-base"
          />
        </div>

        {/* Phone with country code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <div className="flex gap-2">
            <Select
              value={form.countryCode}
              onChange={(value) => handleChange("countryCode", value)}
              size="large"
              className="w-32"
              options={countryCodes.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.code}`,
              }))}
            />
            <Input
              placeholder="9 1234 5678"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
              size="large"
              className="flex-1 !text-base"
              maxLength={12}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje
          </label>
          <TextArea
            placeholder="Escribe tu mensaje aquí..."
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={4}
            className="!text-base"
          />
        </div>

        {/* Submit button */}
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={handleSubmit}
          className="!bg-[#262011] hover:!bg-[#3d3018] mt-2 !h-12 !text-base font-semibold"
        >
          Enviar Mensaje
        </Button>
      </div>
    </Modal>
  );
};
