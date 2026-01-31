// src/components/Header.jsx

import { Link } from "react-router-dom";
import logo from "../assets/images/logoWeb_cortado.png";
import { HeaderSearch } from "../components/SearchBar";

export const Header = () => {
  return (
    <header className="bg-[#F5E1A4] text-[#262011] p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 max-w-[80rem] mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Pan Comido" className="h-16 sm:h-24" />
          </Link>
        </div>
        
        {/* Search and Navigation - vertically centered with logo */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 flex-1 justify-center">
          {/* Search */}
          <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
            <HeaderSearch />
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6 text-[#262011] text-lg sm:text-xl font-semibold">
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
            <Link
              to="/contact"
              className="transition hover:underline underline-offset-4"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
