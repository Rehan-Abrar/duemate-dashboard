/**
 * DueMate Entry Point
 * 
 * Initializes React and renders the application.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";

// Find root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure there is a <div id='root'></div> in your HTML."
  );
}

// Create React root and render
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
