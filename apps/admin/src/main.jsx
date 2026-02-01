import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#F5E1A4',
      color: '#262011'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        La Pan Comido
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'normal', marginBottom: '2rem' }}>
        Panel de Administración
      </h2>
      <p style={{ 
        padding: '1rem 2rem',
        backgroundColor: 'rgba(38, 32, 17, 0.1)',
        borderRadius: '8px'
      }}>
        Próximamente disponible — Phase 5-6
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
