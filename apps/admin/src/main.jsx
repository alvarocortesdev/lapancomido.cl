import ReactDOM from "react-dom/client";
import { APP_NAME } from "@lapancomido/shared";

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{APP_NAME} - Admin Panel</h1>
      <p>Panel de administración en construcción...</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
