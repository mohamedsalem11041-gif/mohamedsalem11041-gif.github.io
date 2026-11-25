import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { setConsoleFunction } from "three";
import "./index.css";
import App from "./App";

// Suppress "THREE.WebGLRenderer: Context Lost." when the WebGL context is lost
// (e.g. tab backgrounded, GPU reset). Three still handles the event; we only
// avoid the console message.
setConsoleFunction((type, message, ...params) => {
  if (message === "THREE.WebGLRenderer: Context Lost.") return;
  if (type === "log") console.log(message, ...params);
  else if (type === "warn") console.warn(message, ...params);
  else if (type === "error") console.error(message, ...params);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
