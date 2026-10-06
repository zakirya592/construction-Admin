import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { OfficeProvider } from "@/office";
import App from "@/App";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OfficeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OfficeProvider>
  </StrictMode>,
);
