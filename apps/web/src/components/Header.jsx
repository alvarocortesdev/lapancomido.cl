// src/components/Header.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../config/cloudinary";
import { HeaderSearch } from "../components/SearchBar";
import { ContactModal } from "../components/ContactModal";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const openContactModal = (e) => {
    e?.preventDefault();
    closeMenu();
    setIsContactModalOpen(true);
  };

  return (
    <>
      <header className="bg-[#f5e1a4] text-[#262011] p-3 md:p-4 fixed top-0 left-0 right-0 z-50 md:relative md:top-auto md:left-auto md:right-auto">
        <div className="flex items-center gap-4 md:gap-6 md:justify-between container mx-auto px-3 sm:px-40">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src={BRAND.logoHeader}
                alt="Pan Comido"
                width="600"
                height="200"
                className="h-14 sm:h-16 md:h-24 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Mobile: Texto central */}
          <div className="md:hidden flex-1 text-center">
            <p className="text-base font-semibold">Panadería de Masa Madre</p>
          </div>

          {/* Desktop: Search and Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-md">
              <HeaderSearch />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[#262011] text-xl font-semibold">
            <Link
              to="/"
              className="transition hover:underline underline-offset-4"
            >
              Inicio
            </Link>
            <Link
              to="/catalog"
              className="transition hover:underline underline-offset-4"
            >
              Catálogo
            </Link>
            <button
              onClick={openContactModal}
              className="transition hover:underline underline-offset-4"
            >
              Contacto
            </button>
          </nav>

          {/* Mobile: Hamburger button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-full hover:bg-[#262011]/10 transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`block w-6 h-0.5 bg-[#262011] transition-transform duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#262011] transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#262011] transition-transform duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-[#fff5da] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeMenu}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#262011]/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6 text-[#262011]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <HeaderSearch />
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-col px-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="py-3 px-2 text-lg font-semibold text-[#262011] hover:bg-[#262011]/10 rounded-lg transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/catalog"
              onClick={closeMenu}
              className="py-3 px-2 text-lg font-semibold text-[#262011] hover:bg-[#262011]/10 rounded-lg transition-colors"
            >
              Catálogo
            </Link>
            <button
              onClick={openContactModal}
              className="py-3 px-2 text-lg font-semibold text-[#262011] hover:bg-[#262011]/10 rounded-lg transition-colors text-left"
            >
              Contacto
            </button>
          </nav>
        </div>
      </header>

      {/* Contact Modal */}
      <ContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
