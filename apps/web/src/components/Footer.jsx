// src/components/Footer.jsx

import { BRAND } from "../config/cloudinary";
import { useSiteContent } from "../context/SiteContentContext";
import { FaInstagram } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { toast } from "react-toastify";

export const Footer = () => {
  const { content } = useSiteContent();
  const footer = content.footer || {};

  // Default values if not set
  const address = footer.address || 'Selin Alvarado 935, Caldera';
  const addressUrl = footer.addressUrl || 'https://maps.app.goo.gl/1Ej2EUwZqAXNQrc58';
  const phone = footer.phone || '+56 9 9280 0156';
  const phoneUrl = footer.phoneUrl || 'https://wa.me/56992800156';
  const email = footer.email || 'contacto@lapancomido.cl';
  const instagram = footer.instagram || '@lapancomido';
  const instagramUrl = footer.instagramUrl || 'https://www.instagram.com/lapancomido/';

  return (
    <footer className="bg-[#f5e1a4] text-[#262011] p-4 sm:p-6 md:mt-8">
      <div className="w-full max-w-[80rem] mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Logo + Título en una fila */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={BRAND.logoFooter}
              alt="Pan Comido Logo"
              width="200"
              height="200"
              loading="lazy"
              className="h-16 w-auto flex-shrink-0 object-contain"
            />
            <div>
              <p className="font-bold text-lg">Pan Comido</p>
              <p className="text-sm">Panadería artesanal en Caldera, Atacama</p>
            </div>
          </div>

          {/* Datos de contacto - centrados pero alineados a la izquierda */}
          <div className="flex justify-center">
            <div className="space-y-2 text-sm">
              <a
                href={addressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <SlLocationPin className="flex-shrink-0" />
                <span>{address}</span>
              </a>
              <a
                href={phoneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <LuPhone className="flex-shrink-0" />
                <span>{phone}</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(email);
                  toast.success("Correo copiado");
                }}
                className="flex items-center gap-2 py-1 hover:underline cursor-pointer"
              >
                <MdOutlineMailOutline className="flex-shrink-0" />
                <span>{email}</span>
              </button>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <FaInstagram className="flex-shrink-0" />
                <span>{instagram}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <img
              src={BRAND.logoFooter}
              alt="Pan Comido Logo"
              width="200"
              height="200"
              loading="lazy"
              className="h-24 w-auto flex-shrink-0 object-contain"
            />

            {/* Divisor vertical */}
            <div className="w-[2px] bg-[#262011] self-stretch"></div>

            {/* Texto y contactos */}
            <div>
              <p className="font-bold text-lg">Pan Comido</p>
              <p className="text-base mb-3">
                Panadería artesanal en Caldera, Atacama
              </p>

              {/* Datos de contacto en lista */}
              <div className="space-y-1 text-sm">
                <a
                  href={addressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <SlLocationPin className="flex-shrink-0" />
                  <span>{address}</span>
                </a>
                <a
                  href={phoneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <LuPhone className="flex-shrink-0" />
                  <span>{phone}</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success("Correo copiado");
                  }}
                  className="flex items-center gap-2 hover:underline cursor-pointer"
                >
                  <MdOutlineMailOutline className="flex-shrink-0" />
                  <span>{email}</span>
                </button>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <FaInstagram className="flex-shrink-0" />
                  <span>{instagram}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
