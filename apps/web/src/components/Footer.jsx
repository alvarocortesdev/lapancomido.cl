// src/components/Footer.jsx

import logo from "../assets/images/logoRedondo_cortado.png";
import { FaInstagram } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";

export const Footer = () => {
  return (
    <footer className="bg-[#f5e1a4] text-[#262011] p-4 sm:p-6 md:mt-8">
      <div className="w-full max-w-[80rem] mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Logo + Título en una fila */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={logo}
              alt="Pan Comido Logo"
              className="h-16 flex-shrink-0"
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
                href="https://maps.app.goo.gl/1Ej2EUwZqAXNQrc58"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <SlLocationPin className="flex-shrink-0" />
                <span>Selin Alvarado 935, Caldera</span>
              </a>
              <a
                href="https://wa.me/56992800156"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <LuPhone className="flex-shrink-0" />
                <span>+56 9 9280 0156</span>
              </a>
              <a
                href="mailto:lapancomido@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <MdOutlineMailOutline className="flex-shrink-0" />
                <span>lapancomido@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/lapancomido/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:underline"
              >
                <FaInstagram className="flex-shrink-0" />
                <span>@lapancomido</span>
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <img
              src={logo}
              alt="Pan Comido Logo"
              className="h-24 flex-shrink-0"
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
                  href="https://maps.app.goo.gl/1Ej2EUwZqAXNQrc58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <SlLocationPin className="flex-shrink-0" />
                  <span>Selin Alvarado 935, Caldera</span>
                </a>
                <a
                  href="https://wa.me/56992800156"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <LuPhone className="flex-shrink-0" />
                  <span>+56 9 9280 0156</span>
                </a>
                <a
                  href="mailto:lapancomido@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <MdOutlineMailOutline className="flex-shrink-0" />
                  <span>lapancomido@gmail.com</span>
                </a>
                <a
                  href="https://www.instagram.com/lapancomido/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <FaInstagram className="flex-shrink-0" />
                  <span>@lapancomido</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
