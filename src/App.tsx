/**
 * DueMate App
 * 
 * Main application component with routing and auth state management.
 */

import { useState, useEffect } from "react";
import { theme, generateCSSVariables } from "./theme";
import { LoginPage } from "./LoginPage";
import { Dashboard } from "./Dashboard";
import { 
  handleLoginSuccess as storeLoginData,
  getValidToken,
  clearAuth
} from "./auth";
import { authApi } from "./api";
import type { AuthVerifyResponse } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const globalStyles = `
  ${generateCSSVariables()}
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    font-family: ${theme.fonts.body};
    background-color: ${theme.colors.surface};
    color: ${theme.colors.text};
    line-height: ${theme.lineHeights.normal};
  }
  
  input, button, select, textarea {
    font-family: inherit;
  }
  
  a {
    color: ${theme.colors.brand};
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.borderLight};
  }
  
  /* Focus visible outline */
  :focus-visible {
    outline: 2px solid ${theme.colors.focus};
    outline-offset: 2px;
  }
  
  /* Remove default focus outline for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }
  
  /* Loading screen */
  .app-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${theme.colors.surface};
  }
  
  .app-loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid ${theme.colors.border};
    border-top-color: ${theme.colors.brand};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type AppState = "loading" | "unauthenticated" | "authenticated";

export function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Try to get a valid token (will attempt silent refresh if needed)
      const token = await getValidToken();
      
      if (!token) {
        // No valid token and refresh failed — user must login
        setAppState("unauthenticated");
        return;
      }
      
      try {
        // Verify the session is still valid with the backend
        await authApi.verifySession();
        setAppState("authenticated");
      } catch (error) {
        // Verification failed — clear tokens and show login
        console.error("Session verification failed:", error);
        clearAuth();
        setAppState("unauthenticated");
      }
    };
    
    checkAuth();
  }, []);
  
  // Handle successful login
  const handleLoginSuccess = (response: AuthVerifyResponse) => {
    storeLoginData(response);
    setAppState("authenticated");
  };
  
  // Handle logout
  const handleLogout = () => {
    setAppState("unauthenticated");
  };
  
  return (
    <>
      {/* Global Styles */}
      <style>{globalStyles}</style>
      
      {/* Loading State */}
      {appState === "loading" && (
        <div className="app-loading">
          <div className="app-loading-spinner" />
        </div>
      )}
      
      {/* Unauthenticated - Show Login */}
      {appState === "unauthenticated" && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      
      {/* Authenticated - Show Dashboard */}
      {appState === "authenticated" && (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
