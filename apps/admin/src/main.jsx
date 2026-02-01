// src/main.jsx
import ReactDOM from "react-dom/client";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import "./index.css";

function AdminContent() {
  const { isAuthenticated, loading, user, logout, isDeveloper } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8E8]">
        <div className="text-[#262011]">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FDF8E8]">
      <header className="bg-[#262011] text-[#F5E1A4] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">La Pan Comido - Admin</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentPage('settings')}
              className="text-sm opacity-80 hover:opacity-100"
            >
              {user?.username}
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 bg-[#F5E1A4] text-[#262011] rounded text-sm font-medium hover:bg-[#F5E1A4]/90 min-h-[36px]"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px ${
              currentPage === 'dashboard' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`py-3 px-2 text-sm font-medium border-b-2 -mb-px ${
              currentPage === 'settings' 
                ? 'border-[#262011] text-[#262011]' 
                : 'border-transparent text-[#262011]/60 hover:text-[#262011]'
            }`}
          >
            Configuración
          </button>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {currentPage === 'dashboard' && (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#262011] mb-2">
              ¡Bienvenido, {user?.username}!
            </h2>
            <p className="text-[#262011]/60 text-sm sm:text-base">
              El panel de administración estará disponible en la siguiente fase.
            </p>
            {isDeveloper && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                Tienes acceso de desarrollador.
              </div>
            )}
          </div>
        )}
        
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
