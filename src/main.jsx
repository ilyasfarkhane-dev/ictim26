import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ConferenceProvider } from "./context/ConferenceContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ConferenceProvider>
        <App />
      </ConferenceProvider>
    </AuthProvider>
  </StrictMode>
);
