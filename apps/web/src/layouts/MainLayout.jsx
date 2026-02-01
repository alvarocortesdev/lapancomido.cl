// src/layouts/MainLayout.jsx

import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Credits } from "../components/Credits";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Spacer para compensar header fijo en mobile */}
      <div className="h-16 md:hidden" />
      <main className="flex-grow container mx-auto px-3 sm:px-40 py-4">
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </main>
      <Footer />
      <Credits />
    </div>
  );
};
